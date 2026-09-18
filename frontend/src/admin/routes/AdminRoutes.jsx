import { Routes, Route } from "react-router-dom";

import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

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
