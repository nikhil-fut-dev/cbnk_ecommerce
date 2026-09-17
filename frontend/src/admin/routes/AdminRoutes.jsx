import { Routes, Route } from "react-router-dom";

import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

import AdminDashboard from "../pages/dashboard/AdminDashboard";
import AdminProducts from "../pages/products/AdminProducts";
import AdminProductDetails from "../pages/products/AdminProductDetails";
import AdminOrders from "../pages/orders/AdminOrders";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/products" element={<AdminProducts />} />

          <Route path="/admin/products/:id" element={<AdminProductDetails />} />

          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
