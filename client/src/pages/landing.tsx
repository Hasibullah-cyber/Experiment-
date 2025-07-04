import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Shield, Truck, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-amazon-gray">
      {/* Hero Section */}
      <div className="amazon-navy text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              ShopCenter
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Your One-Stop Shopping Destination
            </p>
            <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
              Discover millions of products at unbeatable prices. From electronics to fashion, 
              home essentials to books - we have everything you need.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="amazon-button text-lg px-8 py-3 h-auto"
            >
              <a href="/api/login">
                Sign In to Start Shopping
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold amazon-text mb-4">
            Why Choose ShopCenter?
          </h2>
          <p className="text-lg amazon-light-text">
            We make online shopping easy, secure, and enjoyable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Millions of Products</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse through our vast collection of products from top brands worldwide.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Truck className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Fast Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get your orders delivered quickly with our reliable shipping network.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Secure Shopping</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Shop with confidence knowing your data and payments are secure.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Quality Guaranteed</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Every product is carefully selected and quality-checked before shipping.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="amazon-navy text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg mb-8 text-gray-200">
            Join millions of satisfied customers and experience the future of online shopping.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="amazon-button text-lg px-8 py-3 h-auto"
          >
            <a href="/api/login">
              Get Started Now
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
