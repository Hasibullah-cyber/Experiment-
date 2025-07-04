import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors = {
  pending: "secondary",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
} as const;

export default function AdminOrders() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const itemsPerPage = 10;

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders", { search: searchQuery, status: statusFilter, page: currentPage }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      params.append("limit", itemsPerPage.toString());
      params.append("offset", ((currentPage - 1) * itemsPerPage).toString());
      
      const response = await fetch(`/api/orders?${params}`);
      return response.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery({
    queryKey: ["/api/orders", selectedOrder?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${selectedOrder.id}`);
      return response.json();
    },
    enabled: !!selectedOrder?.id,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order updated",
        description: "The order status has been successfully updated",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, isAuthenticated, authLoading, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleStatusUpdate = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-amazon-gray">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null; // Will redirect via useEffect
  }

  const totalPages = Math.ceil((ordersData?.total || 0) / itemsPerPage);

  return (
    <div className="min-h-screen bg-amazon-gray">
      <Header />
      
      <main>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold amazon-text">Orders Management</h1>
                <p className="text-muted-foreground">
                  Track and manage customer orders
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  All Orders ({ordersData?.total || 0})
                </CardTitle>
                
                <div className="flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Button type="submit" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {ordersData?.orders?.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData.orders.map((order: any) => {
                        const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock;
                        return (
                          <TableRow key={order.id}>
                            <TableCell>
                              <p className="font-medium">#{order.orderNumber}</p>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">
                                ${parseFloat(order.total).toFixed(2)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={statusColors[order.status as keyof typeof statusColors]}
                                className="flex items-center gap-1 w-fit"
                              >
                                <StatusIcon className="h-3 w-3" />
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={order.paymentStatus === "paid" ? "default" : "secondary"}
                              >
                                {order.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedOrder(order)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Order #{order.orderNumber}</DialogTitle>
                                      <DialogDescription>
                                        Order details and items
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    {orderDetailsLoading ? (
                                      <div className="space-y-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                      </div>
                                    ) : orderDetails ? (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <h4 className="font-medium mb-2">Shipping Address</h4>
                                            <div className="text-sm space-y-1">
                                              <p>{orderDetails.shippingAddress?.firstName} {orderDetails.shippingAddress?.lastName}</p>
                                              <p>{orderDetails.shippingAddress?.address}</p>
                                              <p>{orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.state} {orderDetails.shippingAddress?.zipCode}</p>
                                              <p>{orderDetails.shippingAddress?.country}</p>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="font-medium mb-2">Order Summary</h4>
                                            <div className="text-sm space-y-1">
                                              <p>Subtotal: ${parseFloat(orderDetails.subtotal).toFixed(2)}</p>
                                              <p>Shipping: ${parseFloat(orderDetails.shipping).toFixed(2)}</p>
                                              <p>Tax: ${parseFloat(orderDetails.tax).toFixed(2)}</p>
                                              <p className="font-medium">Total: ${parseFloat(orderDetails.total).toFixed(2)}</p>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <h4 className="font-medium mb-2">Order Items</h4>
                                          <div className="space-y-2">
                                            {orderDetails.items?.map((item: any) => (
                                              <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center gap-3">
                                                  <img
                                                    src={item.product.images?.[0] || "/api/placeholder/40/40"}
                                                    alt={item.product.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                  />
                                                  <div>
                                                    <p className="font-medium text-sm">{item.product.name}</p>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                  </div>
                                                </div>
                                                <p className="text-sm font-medium">
                                                  ${parseFloat(item.total).toFixed(2)}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    ) : null}
                                  </DialogContent>
                                </Dialog>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleStatusUpdate(order.id, "processing")}
                                      disabled={order.status === "processing"}
                                    >
                                      Mark as Processing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleStatusUpdate(order.id, "shipped")}
                                      disabled={order.status === "shipped" || order.status === "delivered"}
                                    >
                                      Mark as Shipped
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleStatusUpdate(order.id, "delivered")}
                                      disabled={order.status === "delivered"}
                                    >
                                      Mark as Delivered
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleStatusUpdate(order.id, "cancelled")}
                                      disabled={order.status === "cancelled" || order.status === "delivered"}
                                      className="text-destructive"
                                    >
                                      Cancel Order
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className="w-10 h-10"
                          >
                            {page}
                          </Button>
                        ))}
                        
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter
                      ? "No orders match your search criteria"
                      : "No orders have been placed yet"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
