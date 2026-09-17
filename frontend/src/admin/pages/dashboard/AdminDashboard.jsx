import { useEffect, useState } from "react";
import { RefreshCw, TrendingUp, PackageCheck, CreditCard } from "lucide-react";
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
      console.error("Admin dashboard error:", error);

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

  if (loading && !dashboard) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />

          <p className="mt-4 text-sm font-medium text-neutral-500">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-neutral-100 p-6">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-neutral-900">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
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

  const {
    overview = {},
    orders = {},
    lowStock = {},
    recentOrders = [],
    recentCustomers = [],
  } = dashboard;

  const revenue = Number(overview.totalRevenue || 0);

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-neutral-100 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================
            Dashboard Header
        ===================================== */}
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Store Overview
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 md:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Monitor your store performance, orders, customers and inventory
              from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />

            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* =====================================
            Primary KPI Cards
        ===================================== */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={overview.totalCustomers ?? 0}
            type="customers"
            subtitle="Registered customers"
          />

          <StatCard
            title="Total Products"
            value={overview.totalProducts ?? 0}
            type="products"
            subtitle={`${overview.activeProducts ?? 0} currently active`}
          />

          <StatCard
            title="Total Orders"
            value={overview.totalOrders ?? 0}
            type="orders"
            subtitle={`${overview.paidOrders ?? 0} paid orders`}
          />

          <StatCard
            title="Total Revenue"
            value={`₹${revenue.toLocaleString("en-IN")}`}
            type="revenue"
            subtitle="Recorded order revenue"
          />
        </div>

        {/* =====================================
            Order Overview
        ===================================== */}
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-950">
                Order Overview
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Current order pipeline
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <TrendingUp size={15} />
              {orders.total ?? 0} total orders
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <OrderStatusCard
              title="Pending"
              value={orders.pending}
              tone="warning"
            />

            <OrderStatusCard
              title="Confirmed"
              value={orders.confirmed}
              tone="info"
            />

            <OrderStatusCard
              title="Processing"
              value={orders.processing}
              tone="processing"
            />

            <OrderStatusCard
              title="Shipped"
              value={orders.shipped}
              tone="info"
            />

            <OrderStatusCard
              title="Delivered"
              value={orders.delivered}
              tone="success"
            />

            <OrderStatusCard
              title="Cancelled"
              value={orders.cancelled}
              tone="danger"
            />
          </div>
        </section>

        {/* =====================================
            Secondary KPIs
        ===================================== */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
              <PackageCheck size={20} />
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-500">
                Active Products
              </p>

              <p className="mt-1 text-2xl font-bold text-neutral-950">
                {overview.activeProducts ?? 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
              <CreditCard size={20} />
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-500">
                Paid Orders
              </p>

              <p className="mt-1 text-2xl font-bold text-neutral-950">
                {overview.paidOrders ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================
            Inventory Alert
        ===================================== */}
        <div className="mt-6">
          <LowStockList products={lowStock?.products || []} />
        </div>

        {/* =====================================
            Recent Activity
        ===================================== */}
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <RecentOrders orders={recentOrders} />

          <RecentCustomers customers={recentCustomers} />
        </div>

        {/* Footer */}
        <div className="py-7 text-center text-xs text-neutral-400">
          CBNK Admin Console
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
