import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CartItem from "@/components/cart-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ShoppingCart, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function CartPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
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
        description: "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to view your cart",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-amazon-gray">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b">
                      <Skeleton className="h-20 w-20" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="lg:w-1/3">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const subtotal = cartItems?.reduce((sum: number, item: any) => {
    const price = parseFloat(item.product.salePrice || item.product.price);
    return sum + (price * item.quantity);
  }, 0) || 0;

  const shipping = subtotal > 25 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-amazon-gray">
      <Header />
      
      <main>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <h1 className="text-2xl font-bold amazon-text">Shopping Cart</h1>
          </div>

          {!cartItems || cartItems.length === 0 ? (
            <Card className="p-8 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">
                Add some products to your cart to get started
              </p>
              <Button asChild className="amazon-button">
                <Link href="/products">Start Shopping</Link>
              </Button>
            </Card>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Cart Items */}
              <div className="lg:w-2/3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">
                      Shopping Cart ({cartItems.length} items)
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearCartMutation.mutate()}
                      disabled={clearCartMutation.isPending}
                    >
                      Clear Cart
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cartItems.map((item: any) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:w-1/3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="amazon-light-text">Subtotal ({cartItems.length} items):</span>
                        <span className="amazon-text">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="amazon-light-text">Shipping:</span>
                        <span className="amazon-text">
                          {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="amazon-light-text">Tax:</span>
                        <span className="amazon-text">${tax.toFixed(2)}</span>
                      </div>
                      <hr className="my-3" />
                      <div className="flex justify-between text-lg font-bold">
                        <span className="amazon-text">Total:</span>
                        <span className="amazon-text">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button asChild className="w-full amazon-button mt-6">
                      <Link href="/checkout">
                        Proceed to Checkout
                      </Link>
                    </Button>

                    <div className="mt-4 text-sm amazon-light-text space-y-1">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>FREE shipping on orders over $25</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        <span>30-day return policy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Secure checkout with SSL</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
