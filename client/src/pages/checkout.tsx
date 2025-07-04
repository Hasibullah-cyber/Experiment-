import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CreditCard, Truck, Shield } from "lucide-react";
import { Link } from "wouter";

const checkoutSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { cartItems, cartTotal } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
      billingAddress: {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
      paymentMethod: "credit-card",
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully!",
        description: `Your order #${data.orderNumber} has been placed and will be processed soon.`,
      });
      // Redirect to order confirmation or orders page
      window.location.href = "/orders";
    },
    onError: (error) => {
      setIsPlacingOrder(false);
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
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to checkout",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Redirect to cart if empty
  useEffect(() => {
    if (cartItems && cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checkout",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/cart";
      }, 1000);
    }
  }, [cartItems, toast]);

  const onSubmit = (data: CheckoutFormData) => {
    setIsPlacingOrder(true);
    
    const subtotal = cartTotal;
    const shipping = subtotal > 25 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const billingAddress = sameAsShipping ? data.shippingAddress : data.billingAddress;

    const orderData = {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      shippingAddress: data.shippingAddress,
      billingAddress,
      paymentMethod: data.paymentMethod,
      paymentStatus: "pending",
      status: "pending",
    };

    placeOrderMutation.mutate(orderData);
  };

  if (authLoading || !cartItems) {
    return (
      <div className="min-h-screen bg-amazon-gray">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || cartItems.length === 0) {
    return null; // Will redirect via useEffect
  }

  const subtotal = cartTotal;
  const shipping = subtotal > 25 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-amazon-gray">
      <Header />
      
      <main>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
            <h1 className="text-2xl font-bold amazon-text">Checkout</h1>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shipping-firstName">First Name</Label>
                        <Input
                          id="shipping-firstName"
                          {...form.register("shippingAddress.firstName")}
                        />
                        {form.formState.errors.shippingAddress?.firstName && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.shippingAddress.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="shipping-lastName">Last Name</Label>
                        <Input
                          id="shipping-lastName"
                          {...form.register("shippingAddress.lastName")}
                        />
                        {form.formState.errors.shippingAddress?.lastName && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.shippingAddress.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="shipping-address">Address</Label>
                      <Input
                        id="shipping-address"
                        {...form.register("shippingAddress.address")}
                      />
                      {form.formState.errors.shippingAddress?.address && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.shippingAddress.address.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shipping-city">City</Label>
                        <Input
                          id="shipping-city"
                          {...form.register("shippingAddress.city")}
                        />
                        {form.formState.errors.shippingAddress?.city && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.shippingAddress.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="shipping-state">State</Label>
                        <Input
                          id="shipping-state"
                          {...form.register("shippingAddress.state")}
                        />
                        {form.formState.errors.shippingAddress?.state && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.shippingAddress.state.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shipping-zipCode">ZIP Code</Label>
                        <Input
                          id="shipping-zipCode"
                          {...form.register("shippingAddress.zipCode")}
                        />
                        {form.formState.errors.shippingAddress?.zipCode && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.shippingAddress.zipCode.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="shipping-country">Country</Label>
                        <Input
                          id="shipping-country"
                          {...form.register("shippingAddress.country")}
                        />
                        {form.formState.errors.shippingAddress?.country && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.shippingAddress.country.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="checkbox"
                        id="same-as-shipping"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="same-as-shipping">Same as shipping address</Label>
                    </div>

                    {!sameAsShipping && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billing-firstName">First Name</Label>
                            <Input
                              id="billing-firstName"
                              {...form.register("billingAddress.firstName")}
                            />
                          </div>
                          <div>
                            <Label htmlFor="billing-lastName">Last Name</Label>
                            <Input
                              id="billing-lastName"
                              {...form.register("billingAddress.lastName")}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="billing-address">Address</Label>
                          <Input
                            id="billing-address"
                            {...form.register("billingAddress.address")}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billing-city">City</Label>
                            <Input
                              id="billing-city"
                              {...form.register("billingAddress.city")}
                            />
                          </div>
                          <div>
                            <Label htmlFor="billing-state">State</Label>
                            <Input
                              id="billing-state"
                              {...form.register("billingAddress.state")}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billing-zipCode">ZIP Code</Label>
                            <Input
                              id="billing-zipCode"
                              {...form.register("billingAddress.zipCode")}
                            />
                          </div>
                          <div>
                            <Label htmlFor="billing-country">Country</Label>
                            <Input
                              id="billing-country"
                              {...form.register("billingAddress.country")}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={form.watch("paymentMethod")}
                      onValueChange={(value) => form.setValue("paymentMethod", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card">Credit Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal">PayPal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="apple-pay" id="apple-pay" />
                        <Label htmlFor="apple-pay">Apple Pay</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-3">
                        {cartItems.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <img
                              src={item.product.images?.[0] || "/api/placeholder/50/50"}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="text-sm font-medium">
                              ${((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Order Totals */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal ({cartItems.length} items):</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Shipping:</span>
                          <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax:</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full amazon-button"
                        disabled={isPlacingOrder || placeOrderMutation.isPending}
                      >
                        {isPlacingOrder ? "Placing Order..." : "Place Order"}
                      </Button>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>Secure checkout with SSL encryption</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-3 w-3" />
                          <span>FREE shipping on orders over $25</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
