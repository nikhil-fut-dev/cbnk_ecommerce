import { Routes, Route } from "react-router-dom";

import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

import AdminDashboard from "../pages/dashboard/AdminDashboard";
import AdminProducts from "../pages/products/AdminProducts";
import AdminProductDetails from "../pages/products/AdminProductDetails";
import AdminOrders from "../pages/orders/AdminOrders";
import AdminOrderDetails from "../pages/orders/AdminOrderDetails";
import AdminCategories from "../pages/categories/AdminCategories";
import AdminCategoryForm from "../pages/categories/AdminCategoryForm";
import AdminCoupons from "../pages/coupons/AdminCoupons";
import AdminCouponForm from "../pages/coupons/AdminCouponForm";
import AdminInventory from "../pages/inventory/AdminInventory";
import AdminInventoryDetails from "../pages/inventory/AdminInventoryDetails";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/products" element={<AdminProducts />} />

          <Route path="/admin/products/:id" element={<AdminProductDetails />} />

          <Route path="/admin/orders" element={<AdminOrders />} />

          <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />

          <Route path="/admin/categories" element={<AdminCategories />} />

          <Route path="/admin/categories/new" element={<AdminCategoryForm />} />

          <Route
            path="/admin/categories/:id/edit"
            element={<AdminCategoryForm />}
          />

          <Route path="/admin/coupons" element={<AdminCoupons />} />

          <Route path="/admin/coupons/new" element={<AdminCouponForm />} />

          <Route path="/admin/coupons/:id/edit" element={<AdminCouponForm />} />

          <Route path="/admin/inventory" element={<AdminInventory />} />

          <Route
            path="/admin/inventory/:id"
            element={<AdminInventoryDetails />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
