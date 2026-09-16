import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { getMyOrders } from "../../services/api/orderApi";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOrders({
        page,
        limit: 10,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load orders");
      }

      setOrders(response.orders || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error("Load orders error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load orders";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-700";

      case "PROCESSING":
      case "CONFIRMED":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-32 rounded-xl bg-gray-200" />
            <div className="h-32 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">Account</p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">My Orders</h1>

          <p className="mt-2 text-sm text-gray-500">
            Track and manage your CBNK orders.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!error && orders.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your orders will appear here after you place your first order.
            </p>

            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders */}
        {orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Top */}
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Order Number
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {order.orderNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Order Date
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      order.orderStatus,
                    )}`}
                  >
                    {order.orderStatus?.replaceAll("_", " ")}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">Items</p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {order.items?.length || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {order.paymentMethod || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Payment Status</p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {order.paymentStatus || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Total</p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹{Number(order.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Items Preview */}
                  {order.items?.length > 0 && (
                    <div className="mt-5 border-t border-gray-100 pt-5">
                      <div className="space-y-3">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div
                            key={`${item.product}-${index}`}
                            className="flex items-center gap-3"
                          >
                            {item.image?.url ? (
                              <img
                                src={item.image.url}
                                alt={item.name}
                                className="h-14 w-14 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                No Image
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {item.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}

                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-500">
                            + {order.items.length - 2} more item(s)
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-5 flex justify-end border-t border-gray-100 pt-5">
                    <Link
                      to={`/account/orders/${order._id}`}
                      className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm font-medium text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNext}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
