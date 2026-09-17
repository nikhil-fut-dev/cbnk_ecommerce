import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getAdminDashboard } from "../../services/adminDashboardApi";

import StatCard from "../../components/dashboard/StatCard";
import OrderStatusCard from "../../components/dashboard/OrderStatusCard";
import LowStockList from "../../components/dashboard/LowStockList";
import RecentOrders from "../../components/dashboard/RecentOrders";
import RecentCustomers from "../../components/dashboard/RecentCustomers";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await getAdminDashboard();

      if (response.success) {
        setDashboard(response.data);
      } else {
        toast.error(response.message || "Unable to load dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to load admin dashboard";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Initial loading
  if (loading && !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />

          <p className="mt-4 text-sm text-neutral-500">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  // API failed
  if (!dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Something went wrong while fetching dashboard data.
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-6 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const { overview, orders, lowStock, recentOrders, recentCustomers } =
    dashboard;

  return (
    <main className="min-h-screen bg-neutral-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-neutral-600">
              Overview of your CBNK ecommerce store.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </div>

        {/* Main Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Customers" value={overview.totalCustomers} />

          <StatCard title="Total Products" value={overview.totalProducts} />

          <StatCard title="Total Orders" value={overview.totalOrders} />

          <StatCard title="Total Revenue" value={`₹${overview.totalRevenue}`} />
        </div>

        {/* Order Status */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">
            Order Status
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <OrderStatusCard title="Pending" value={orders.pending} />

            <OrderStatusCard title="Confirmed" value={orders.confirmed} />

            <OrderStatusCard title="Processing" value={orders.processing} />

            <OrderStatusCard title="Shipped" value={orders.shipped} />

            <OrderStatusCard title="Delivered" value={orders.delivered} />

            <OrderStatusCard title="Cancelled" value={orders.cancelled} />
          </div>
        </section>

        {/* Additional Statistics */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <StatCard title="Active Products" value={overview.activeProducts} />

          <StatCard title="Paid Orders" value={overview.paidOrders} />
        </div>

        {/* Low Stock */}
        <div className="mt-8">
          <LowStockList products={lowStock?.products || []} />
        </div>

        {/* Recent Orders & Customers */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <RecentOrders orders={recentOrders || []} />

          <RecentCustomers customers={recentCustomers || []} />
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
