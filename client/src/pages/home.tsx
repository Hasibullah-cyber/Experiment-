import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Laptop, Shirt, Home, Book, Gamepad2, Dumbbell } from "lucide-react";
import type { Product, Category } from "@shared/schema";

export default function HomePage() {
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ["/api/products/featured"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const categoryIcons = {
    electronics: Laptop,
    fashion: Shirt,
    home: Home,
    books: Book,
    toys: Gamepad2,
    sports: Dumbbell,
  };

  return (
    <div className="min-h-screen bg-amazon-gray">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-white">
          <div className="container mx-auto px-4">
            <div className="relative h-96 amazon-navy rounded-lg overflow-hidden my-4">
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="relative z-10 flex items-center justify-center h-full text-white text-center">
                <div>
                  <h2 className="text-4xl font-bold mb-4">Summer Sale - Up to 70% Off</h2>
                  <p className="text-xl mb-6">Discover amazing deals on top brands</p>
                  <Button asChild size="lg" className="amazon-button">
                    <Link href="/products">Shop Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold amazon-text mb-6">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categoriesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="text-center p-4">
                    <Skeleton className="h-8 w-8 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </Card>
                ))
              ) : (
                categories?.slice(0, 6).map((category: Category) => {
                  const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Laptop;
                  return (
                    <Card key={category.id} className="text-center p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <Link href={`/products?category=${category.id}`}>
                        <CardContent className="p-0">
                          <IconComponent className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="text-sm font-medium">{category.name}</p>
                        </CardContent>
                      </Link>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold amazon-text">Featured Products</h2>
              <Button asChild variant="outline">
                <Link href="/products?featured=true">View All</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </Card>
                ))
              ) : (
                featuredProducts?.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Deals Section */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold amazon-text mb-6">Today's Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="amazon-orange p-6 text-center">
                <CardHeader>
                  <Badge className="w-fit mx-auto mb-2">Limited Time</Badge>
                  <CardTitle className="text-2xl">Electronics Sale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg mb-4">Up to 50% off on laptops, phones, and accessories</p>
                  <Button asChild variant="secondary" className="amazon-button-secondary">
                    <Link href="/products?category=electronics">Shop Electronics</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="amazon-blue text-white p-6 text-center">
                <CardHeader>
                  <Badge className="w-fit mx-auto mb-2 bg-white text-blue-600">New Arrivals</Badge>
                  <CardTitle className="text-2xl">Fashion Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg mb-4">Latest trends in clothing and accessories</p>
                  <Button asChild variant="secondary" className="amazon-button-secondary">
                    <Link href="/products?category=fashion">Shop Fashion</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="amazon-yellow p-6 text-center">
                <CardHeader>
                  <Badge className="w-fit mx-auto mb-2 bg-white text-yellow-600">Free Shipping</Badge>
                  <CardTitle className="text-2xl">Home Essentials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg mb-4">Everything you need for your home</p>
                  <Button asChild variant="secondary" className="amazon-button-secondary">
                    <Link href="/products?category=home">Shop Home</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
