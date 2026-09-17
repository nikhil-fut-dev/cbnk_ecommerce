import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../services/api/cartApi";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);

      const response = await getCart();

      if (response?.success) {
        setCart(response.cart);
      }
    } catch (error) {
      console.error(
        "Fetch cart error:",
        error?.response?.data?.message || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const refreshCart = async () => {
    await fetchCart();
  };

  const updateItemQuantity = async (itemId, quantity) => {
    try {
      const response = await updateCartItem(itemId, quantity);

      if (response?.success) {
        setCart(response.cart);
        toast.success("Cart updated");
      }

      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update cart");

      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await removeCartItem(itemId);

      if (response?.success) {
        setCart(response.cart);
        toast.success("Item removed from cart");
      }

      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to remove item");

      throw error;
    }
  };

  const emptyCart = async () => {
    try {
      const response = await clearCart();

      if (response?.success) {
        setCart(response.cart);
        toast.success("Cart cleared");
      }

      return response;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to clear cart");

      throw error;
    }
  };

  const totalItems = cart?.items?.length || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems,
        fetchCart,
        refreshCart,
        updateItemQuantity,
        removeItem,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
