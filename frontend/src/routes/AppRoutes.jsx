import { Routes, Route } from "react-router-dom";

// Customer pages
import Home from "../pages/home/home";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Account from "../pages/account/Account";
import ProtectedRoute from "./ProtectedRoute";
import ProductDetails from "../pages/product/ProductDetails";
import Cart from "../pages/cart/Cart";
import Wishlist from "../pages/wishlist/Wishlist";
import Shop from "../pages/shop/Shop";
import Addresses from "../pages/account/Addresses";
import Checkout from "../pages/checkout/Checkout";
import Orders from "../pages/account/Orders";
import OrderDetails from "../pages/account/OrderDetails";
import MyReviews from "../pages/account/MyReviews";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Admin
import AdminRoutes from "../admin/routes/AdminRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ==================== CUSTOMER ROUTES ==================== */}

      <Route path="/" element={<Home />} />

      <Route path="/shop" element={<Shop />} />

      <Route path="/register" element={<Register />} />

      <Route path="/login" element={<Login />} />

      <Route path="/product/:slug" element={<ProductDetails />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ==================== PROTECTED CUSTOMER ROUTES ==================== */}

      <Route element={<ProtectedRoute />}>
        <Route path="/account" element={<Account />} />

        <Route path="/account/addresses" element={<Addresses />} />

        <Route path="/account/orders" element={<Orders />} />

        <Route path="/account/orders/:id" element={<OrderDetails />} />

        <Route path="/account/reviews" element={<MyReviews />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="/checkout" element={<Checkout />} />
      </Route>

      {/* ==================== ADMIN ROUTES ==================== */}

      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
