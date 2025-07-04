import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  Shield, 
  RotateCcw, 
  ChevronRight,
  Minus,
  Plus
} from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products/slug", params.slug],
    queryFn: async () => {
      const response = await fetch(`/api/products/slug/${params.slug}`);
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/products", product?.id, "reviews"],
    queryFn: async () => {
      const response = await fetch(`/api/products/${product.id}/reviews`);
      return response.json();
    },
    enabled: !!product?.id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      await apiRequest("POST", "/api/cart", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to cart",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("POST", "/api/wishlist", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to Wishlist",
        description: "Product has been added to your wishlist",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to add items to wishlist",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add product to wishlist",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    addToCartMutation.mutate({ productId: product.id, quantity });
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to wishlist",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    addToWishlistMutation.mutate(product.id);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amazon-gray">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-96 w-full mb-4" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-amazon-gray">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist or may have been removed.
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discount = originalPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-amazon-gray">
      <Header />
      
      <main>
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="text-sm amazon-light-text mb-6">
            <ol className="flex space-x-2">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li><Link href="/products" className="hover:text-primary">Products</Link></li>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li className="amazon-text truncate">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Images */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <img
                      src={product.images?.[selectedImageIndex] || "/api/placeholder/400/400"}
                      alt={product.name}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>
                  
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            selectedImageIndex === index 
                              ? 'border-primary' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Product Info */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold amazon-text mb-2">{product.name}</h1>
                    
                    {product.brand && (
                      <p className="text-sm amazon-light-text mb-2">
                        Brand: <span className="font-medium">{product.brand}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {renderStars(parseFloat(product.rating || "0"))}
                      </div>
                      <span className="text-sm amazon-light-text">
                        ({product.reviewCount || 0} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl font-bold amazon-text">
                        ${currentPrice}
                      </span>
                      {originalPrice && (
                        <>
                          <span className="text-lg text-gray-500 line-through">
                            ${originalPrice}
                          </span>
                          <Badge className="amazon-orange">
                            {discount}% OFF
                          </Badge>
                        </>
                      )}
                    </div>

                    {product.shortDescription && (
                      <p className="text-sm amazon-light-text mb-4">
                        {product.shortDescription}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-sm font-medium">Quantity:</span>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-4 font-medium">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={quantity >= (product.stock || 10)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <Button
                        className="w-full amazon-button"
                        onClick={handleAddToCart}
                        disabled={addToCartMutation.isPending}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleAddToWishlist}
                        disabled={addToWishlistMutation.isPending}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        {addToWishlistMutation.isPending ? "Adding..." : "Add to Wishlist"}
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <span>Free shipping on orders over $25</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-primary" />
                        <span>30-day return policy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>2-year warranty included</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Description */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Product Description</h2>
              <div className="prose max-w-none">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p className="text-muted-foreground">No description available.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review: any) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="font-medium">
                          {review.user.firstName} {review.user.lastName}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="font-medium mb-1">{review.title}</h4>
                      )}
                      <p className="text-sm amazon-light-text">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
