import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Star, ShoppingCart, Heart } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });
      setIsAddingToCart(false);
    },
    onError: (error) => {
      setIsAddingToCart(false);
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
    mutationFn: async () => {
      await apiRequest("POST", "/api/wishlist", {
        productId: product.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist`,
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

    setIsAddingToCart(true);
    addToCartMutation.mutate();
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

    addToWishlistMutation.mutate();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-400 text-yellow-400 opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }

    return stars;
  };

  const currentPrice = parseFloat(product.salePrice || product.price);
  const originalPrice = product.salePrice ? parseFloat(product.price) : null;
  const discount = originalPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;

  return (
    <Card className="overflow-hidden product-card-hover group">
      <Link href={`/product/${product.slug}`}>
        <div className="relative">
          <img
            src={product.images?.[0] || "/api/placeholder/300/300"}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 amazon-orange text-black">
              {discount}% OFF
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="absolute top-2 right-2 bg-blue-600">
              Featured
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
            onClick={handleAddToWishlist}
            disabled={addToWishlistMutation.isPending}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold amazon-text mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {product.brand && (
            <p className="text-xs amazon-light-text mb-2">
              {product.brand}
            </p>
          )}
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {renderStars(parseFloat(product.rating || "0"))}
            </div>
            <span className="text-xs amazon-light-text ml-2">
              ({product.reviewCount || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold amazon-text">
                ${currentPrice.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          <Button
            className="w-full amazon-button mt-3"
            onClick={handleAddToCart}
            disabled={isAddingToCart || addToCartMutation.isPending}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}
