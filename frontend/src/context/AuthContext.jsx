import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getCurrentUser, logoutUser } from "../services/api/authApi";

import { useCart } from "./CartContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { clearCartState } = useCart();

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);

      const response = await getCurrentUser();

      if (response.success) {
        setUser(response.user);
        return response.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const logout = async () => {
    try {
      await logoutUser();

      setUser(null);
      clearCartState();

      toast.success("Logout successful");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Logout failed. Please try again.",
      );
    }
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: Boolean(user),
    fetchCurrentUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
