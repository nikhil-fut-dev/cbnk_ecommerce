import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { getAdminOrders } from "../../services/adminOrderApi";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalOrders: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [loading, setLoading] = useState(true);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getAdminOrders({
        page,
        limit: pagination.limit,
      });

      if (response.success) {
        setOrders(response.data?.orders || []);
        setPagination(
          response.data?.pagination || {
            page: 1,
            limit: 20,
            totalOrders: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        );
      } else {
        toast.error(response.message || "Unable to load orders");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to load admin orders";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handlePrevious = () => {
    if (pagination.hasPrev) {
      fetchOrders(pagination.page - 1);
    }
  };

  const handleNext = () => {
    if (pagination.hasNext) {
      fetchOrders(pagination.page + 1);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-50 text-green-700";

      case "CANCELLED":
        return "bg-red-50 text-red-700";

      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-50 text-blue-700";

      case "PROCESSING":
        return "bg-purple-50 text-purple-700";

      case "CONFIRMED":
        return "bg-yellow-50 text-yellow-700";

      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  const getPaymentStatusClasses = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-50 text-green-700";

      case "FAILED":
        return "bg-red-50 text-red-700";

      case "REFUNDED":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-neutral-100 text-neutral-700";
    }
  };

  if (loading && orders.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />

          <p className="mt-4 text-sm text-neutral-500">Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Orders</h1>

            <p className="mt-2 text-neutral-600">
              Manage orders in your CBNK store.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(pagination.page)}
            disabled={loading}
            className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Order Count */}
        <div className="mb-4">
          <p className="text-sm text-neutral-500">
            {pagination.totalOrders} order
            {pagination.totalOrders !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {orders.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-xl font-semibold text-neutral-900">
                No orders found
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                There are currently no orders available.
              </p>

              <button
                type="button"
                onClick={() => fetchOrders(1)}
                className="mt-6 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
                      <th className="px-6 py-4 font-medium">Order</th>

                      <th className="px-6 py-4 font-medium">Customer</th>

                      <th className="px-6 py-4 font-medium">Amount</th>

                      <th className="px-6 py-4 font-medium">Payment</th>

                      <th className="px-6 py-4 font-medium">Payment Status</th>

                      <th className="px-6 py-4 font-medium">Order Status</th>

                      <th className="px-6 py-4 font-medium">Date</th>

                      <th className="px-6 py-4 font-medium">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                      >
                        {/* Order */}
                        <td className="px-6 py-5">
                          <p className="font-semibold text-neutral-900">
                            {order.orderNumber || order._id}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium text-neutral-900">
                              {order.user?.fullName || "Unknown"}
                            </p>

                            <p className="mt-1 text-sm text-neutral-500">
                              {order.user?.email || "N/A"}
                            </p>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-5 text-sm font-semibold text-neutral-900">
                          ₹{order.total ?? 0}
                        </td>

                        {/* Payment Method */}
                        <td className="px-6 py-5 text-sm text-neutral-600">
                          {order.paymentMethod || "N/A"}
                        </td>

                        {/* Payment Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                              order.paymentStatus,
                            )}`}
                          >
                            {order.paymentStatus || "UNKNOWN"}
                          </span>
                        </td>

                        {/* Order Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              order.orderStatus,
                            )}`}
                          >
                            {order.orderStatus || "UNKNOWN"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 text-sm text-neutral-600">
                          {formatDate(order.createdAt)}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-5">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="inline-flex rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-4 border-t border-neutral-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-500">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={!pagination.hasPrev || loading}
                    className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!pagination.hasNext || loading}
                    className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminOrders;
