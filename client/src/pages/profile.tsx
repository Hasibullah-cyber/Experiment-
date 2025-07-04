import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Calendar,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
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

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: wishlist, isLoading: wishlistLoading } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view your profile",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amazon-gray">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-amazon-gray">
      <Header />
      
      <main>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold amazon-text mb-6">My Account</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <Avatar className="h-24 w-24 mx-auto">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback className="text-lg">
                        {getInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h2 className="text-xl font-semibold amazon-text">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                      {user?.role === 'admin' && (
                        <Badge className="mt-2">Administrator</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user?.role === 'admin' && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin">
                        <Package className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/products">
                        <Package className="h-4 w-4 mr-2" />
                        Manage Products
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin/orders">
                        <Package className="h-4 w-4 mr-2" />
                        Manage Orders
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Profile Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="orders" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="orders" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    My Orders
                  </TabsTrigger>
                  <TabsTrigger value="wishlist" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </TabsTrigger>
                  <TabsTrigger value="account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Account Info
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ordersLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      ) : orders && orders.orders?.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order #</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.orders.map((order: any) => {
                              const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock;
                              return (
                                <TableRow key={order.id}>
                                  <TableCell>
                                    <p className="font-medium">#{order.orderNumber}</p>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(order.createdAt).toLocaleDateString()}
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
                                    <p className="font-medium">
                                      ${parseFloat(order.total).toFixed(2)}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={`/orders/${order.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                      </Link>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                          <p className="text-muted-foreground mb-4">
                            You haven't placed any orders yet. Start shopping to see your orders here.
                          </p>
                          <Button asChild className="amazon-button">
                            <Link href="/products">Start Shopping</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="wishlist">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Wishlist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {wishlistLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i}>
                              <Skeleton className="h-48 w-full" />
                              <div className="p-4">
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-20" />
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : wishlist && wishlist.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {wishlist.map((item: any) => (
                            <Card key={item.id} className="overflow-hidden">
                              <Link href={`/product/${item.product.slug}`}>
                                <img
                                  src={item.product.images?.[0] || "/api/placeholder/200/200"}
                                  alt={item.product.name}
                                  className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                  <h3 className="font-semibold amazon-text mb-2 line-clamp-2">
                                    {item.product.name}
                                  </h3>
                                  <p className="text-lg font-bold amazon-text">
                                    ${parseFloat(item.product.salePrice || item.product.price).toFixed(2)}
                                  </p>
                                </div>
                              </Link>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                          <p className="text-muted-foreground mb-4">
                            Save products you love to buy them later.
                          </p>
                          <Button asChild className="amazon-button">
                            <Link href="/products">Browse Products</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="account">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">First Name</label>
                            <p className="text-muted-foreground">{user?.firstName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Last Name</label>
                            <p className="text-muted-foreground">{user?.lastName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <p className="text-muted-foreground">{user?.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Account Type</label>
                            <p className="text-muted-foreground capitalize">{user?.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Account Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Button variant="outline" className="w-full justify-start" disabled>
                            <User className="h-4 w-4 mr-2" />
                            Edit Profile (Coming Soon)
                          </Button>
                          <Button variant="outline" className="w-full justify-start" disabled>
                            <MapPin className="h-4 w-4 mr-2" />
                            Manage Addresses (Coming Soon)
                          </Button>
                          <Button variant="outline" className="w-full justify-start" disabled>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Payment Methods (Coming Soon)
                          </Button>
                          <Button variant="destructive" className="w-full justify-start" asChild>
                            <a href="/api/logout">
                              <User className="h-4 w-4 mr-2" />
                              Sign Out
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
