import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useCart() {
  const { isAuthenticated } = useAuth();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemsCount = cartItems?.reduce((total: number, item: any) => {
    return total + item.quantity;
  }, 0) || 0;

  const cartTotal = cartItems?.reduce((total: number, item: any) => {
    const price = parseFloat(item.product.salePrice || item.product.price);
    return total + (price * item.quantity);
  }, 0) || 0;

  return {
    cartItems,
    cartItemsCount,
    cartTotal,
    isLoading,
  };
}
