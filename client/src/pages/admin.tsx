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
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  Eye,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, isAuthenticated, authLoading, toast]);

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-amazon-gray">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-amazon-gray">
      <Header />
      
      <main>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold amazon-text">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your e-commerce store</p>
            </div>
            
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/admin/products">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/orders">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Manage Orders
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Sales</p>
                    <p className="text-2xl font-bold">
                      ${stats?.totalSales?.toLocaleString() || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold">
                      {stats?.totalOrders?.toLocaleString() || 0}
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Products</p>
                    <p className="text-2xl font-bold">
                      {stats?.totalProducts?.toLocaleString() || 0}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Total Customers</p>
                    <p className="text-2xl font-bold">
                      {stats?.totalCustomers?.toLocaleString() || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/orders">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {stats?.recentOrders?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentOrders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${parseFloat(order.total).toFixed(2)}</p>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : order.status === "shipped"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No recent orders
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Top Selling Products</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/products">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Manage
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {stats?.topProducts?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topProducts.slice(0, 5).map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {product.soldCount} sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${product.revenue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No sales data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href="/admin/products/new">
                    <div className="text-center">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Add New Product</p>
                      <p className="text-sm text-muted-foreground">
                        Create a new product listing
                      </p>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href="/admin/orders?status=pending">
                    <div className="text-center">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Process Orders</p>
                      <p className="text-sm text-muted-foreground">
                        Review pending orders
                      </p>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href="/admin/analytics">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">View Analytics</p>
                      <p className="text-sm text-muted-foreground">
                        Detailed sales reports
                      </p>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
