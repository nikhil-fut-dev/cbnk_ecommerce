import { Routes, Route } from "react-router-dom";

import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

// Home CMS
import AdminHome from "../pages/home/AdminHome";
import AdminPromotionalTicker from "../pages/home/AdminPromotionalTicker";
import AdminPromotionalTickerForm from "../pages/home/AdminPromotionalTickerForm";
import AdminHeroBanners from "../pages/home/AdminHeroBanners";
import AdminHeroBannerForm from "../pages/home/AdminHeroBannerForm";
import AdminCharacterModes from "../pages/home/AdminCharacterModes";
import AdminCharacterModeForm from "../pages/home/AdminCharacterModeForm";

// Dashboard
import AdminDashboard from "../pages/dashboard/AdminDashboard";

// Products
import AdminProducts from "../pages/products/AdminProducts";
import AdminProductDetails from "../pages/products/AdminProductDetails";
import AdminProductForm from "../pages/products/AdminProductForm";

// Orders
import AdminOrders from "../pages/orders/AdminOrders";
import AdminOrderDetails from "../pages/orders/AdminOrderDetails";

// Categories
import AdminCategories from "../pages/categories/AdminCategories";
import AdminCategoryForm from "../pages/categories/AdminCategoryForm";

// Coupons
import AdminCoupons from "../pages/coupons/AdminCoupons";
import AdminCouponForm from "../pages/coupons/AdminCouponForm";

// Inventory
import AdminInventory from "../pages/inventory/AdminInventory";
import AdminInventoryDetails from "../pages/inventory/AdminInventoryDetails";

// Users
import AdminUsers from "../pages/users/AdminUsers";
import AdminUserDetails from "../pages/users/AdminUserDetails";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* ==================== DASHBOARD ==================== */}

          <Route path="/" element={<AdminDashboard />} />

          {/* ==================== HOME CMS ==================== */}

          <Route path="home" element={<AdminHome />} />

          <Route
            path="home/promotional-ticker"
            element={<AdminPromotionalTicker />}
          />

          <Route
            path="home/promotional-ticker/new"
            element={<AdminPromotionalTickerForm />}
          />

          <Route
            path="home/promotional-ticker/:id/edit"
            element={<AdminPromotionalTickerForm />}
          />

          <Route path="home/hero-banners" element={<AdminHeroBanners />} />

          <Route
            path="home/hero-banners/new"
            element={<AdminHeroBannerForm />}
          />

          <Route
            path="home/hero-banners/:id/edit"
            element={<AdminHeroBannerForm />}
          />

          <Route
            path="home/character-modes"
            element={<AdminCharacterModes />}
          />

          <Route
            path="home/character-modes/new"
            element={<AdminCharacterModeForm />}
          />

          <Route
            path="home/character-modes/:id/edit"
            element={<AdminCharacterModeForm />}
          />

          {/* ==================== PRODUCTS ==================== */}

          <Route path="products" element={<AdminProducts />} />

          <Route path="products/new" element={<AdminProductForm />} />

          <Route path="products/:id/edit" element={<AdminProductForm />} />

          <Route path="products/:id" element={<AdminProductDetails />} />

          {/* ==================== ORDERS ==================== */}

          <Route path="orders" element={<AdminOrders />} />

          <Route path="orders/:id" element={<AdminOrderDetails />} />

          {/* ==================== CATEGORIES ==================== */}

          <Route path="categories" element={<AdminCategories />} />

          <Route path="categories/new" element={<AdminCategoryForm />} />

          <Route path="categories/:id/edit" element={<AdminCategoryForm />} />

          {/* ==================== COUPONS ==================== */}

          <Route path="coupons" element={<AdminCoupons />} />

          <Route path="coupons/new" element={<AdminCouponForm />} />

          <Route path="coupons/:id/edit" element={<AdminCouponForm />} />

          {/* ==================== INVENTORY ==================== */}

          <Route path="inventory" element={<AdminInventory />} />

          <Route path="inventory/:id" element={<AdminInventoryDetails />} />

          {/* ==================== USERS ==================== */}

          <Route path="users" element={<AdminUsers />} />

          <Route path="users/:id" element={<AdminUserDetails />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
