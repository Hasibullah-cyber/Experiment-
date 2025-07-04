import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { X, Heart } from "lucide-react";

interface CartItemProps {
  item: {
    id: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      slug: string;
      price: string;
      salePrice?: string;
      images?: string[];
      brand?: string;
      stock?: number;
    };
  };
}

export default function CartItem({ item }: CartItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateQuantityMutation = useMutation({
    mutationFn: async (quantity: number) => {
      await apiRequest("PUT", `/api/cart/${item.id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setIsUpdating(false);
    },
    onError: (error) => {
      setIsUpdating(false);
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
        description: "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cart/${item.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
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
        description: "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/wishlist", { productId: item.product.id });
      await apiRequest("DELETE", `/api/cart/${item.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Moved to wishlist",
        description: "Item has been moved to your wishlist",
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
        description: "Failed to move item to wishlist",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (quantity: string) => {
    const newQuantity = parseInt(quantity);
    if (newQuantity !== item.quantity) {
      setIsUpdating(true);
      updateQuantityMutation.mutate(newQuantity);
    }
  };

  const currentPrice = parseFloat(item.product.salePrice || item.product.price);
  const originalPrice = item.product.salePrice ? parseFloat(item.product.price) : null;
  const totalPrice = currentPrice * item.quantity;

  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0">
      <Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
        <img
          src={item.product.images?.[0] || "/api/placeholder/80/80"}
          alt={item.product.name}
          className="w-20 h-20 object-cover rounded"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.product.slug}`}>
          <h4 className="font-semibold amazon-text hover:text-primary transition-colors">
            {item.product.name}
          </h4>
        </Link>
        
        {item.product.brand && (
          <p className="text-sm amazon-light-text">
            Brand: {item.product.brand}
          </p>
        )}

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm amazon-light-text">Qty:</span>
            <Select
              value={item.quantity.toString()}
              onValueChange={handleQuantityChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.min(10, item.product.stock || 10) }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Button
              variant="link"
              size="sm"
              onClick={() => removeItemMutation.mutate()}
              disabled={removeItemMutation.isPending}
              className="text-amazon-blue hover:text-amazon-light-blue p-0 h-auto"
            >
              Delete
            </Button>
            
            <Button
              variant="link"
              size="sm"
              onClick={() => addToWishlistMutation.mutate()}
              disabled={addToWishlistMutation.isPending}
              className="text-amazon-blue hover:text-amazon-light-blue p-0 h-auto"
            >
              <Heart className="h-3 w-3 mr-1" />
              Save for later
            </Button>
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-lg font-bold amazon-text">
          ${totalPrice.toFixed(2)}
        </div>
        {originalPrice && (
          <div className="text-sm text-gray-500 line-through">
            ${(originalPrice * item.quantity).toFixed(2)}
          </div>
        )}
        <div className="text-sm amazon-light-text">
          ${currentPrice.toFixed(2)} each
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeItemMutation.mutate()}
        disabled={removeItemMutation.isPending}
        className="flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
