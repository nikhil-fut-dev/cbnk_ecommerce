import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getAdminOrderById,
  updateAdminOrderStatus,
  cancelAdminOrder,
} from "../../services/adminOrderApi";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const response = await getAdminOrderById(id);

      if (response.success) {
        setOrder(response.data?.order || null);
      } else {
        toast.error(response.message || "Unable to load order");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load admin order",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!order) return;

    const confirmed = window.confirm(
      `Are you sure you want to change order status to ${newStatus}?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response = await updateAdminOrderStatus(order._id, newStatus);

      if (response.success) {
        toast.success(response.message || "Order status updated");

        await fetchOrder();
      } else {
        toast.error(response.message || "Unable to update order status");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update order status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    const reason = window.prompt(
      "Enter cancellation reason:",
      "Order cancelled by admin",
    );

    if (!reason) return;

    try {
      setActionLoading(true);

      const response = await cancelAdminOrder(order._id, reason);

      if (response.success) {
        toast.success(response.message || "Order cancelled successfully");

        await fetchOrder();
      } else {
        toast.error(response.message || "Unable to cancel order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel order");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";

    return [
      address.fullName,
      address.phone,
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />

          <p className="mt-4 text-sm text-neutral-500">Loading order...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-neutral-900">
            Order not found
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            The requested order could not be found.
          </p>

          <Link
            to="/admin/orders"
            className="mt-5 inline-flex rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const items = order.items || [];

  const canCancel = ["PENDING", "CONFIRMED", "PROCESSING"].includes(
    order.orderStatus,
  );

  const nextStatusMap = {
    PENDING: "CONFIRMED",
    CONFIRMED: "PROCESSING",
    PROCESSING: "SHIPPED",
    SHIPPED: "OUT_FOR_DELIVERY",
    OUT_FOR_DELIVERY: "DELIVERED",
  };

  const nextStatus = nextStatusMap[order.orderStatus];

  return (
    <main className="min-h-screen bg-neutral-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="mb-3 text-sm font-medium text-neutral-500 hover:text-neutral-900"
            >
              ← Back to Orders
            </button>

            <h1 className="text-3xl font-bold text-neutral-900">
              Order Details
            </h1>

            <p className="mt-2 text-neutral-600">
              {order.orderNumber || order._id}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrder}
            disabled={loading || actionLoading}
            className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        {/* Order Summary */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-neutral-500">Order Number</p>

              <h2 className="mt-1 text-xl font-bold text-neutral-900">
                {order.orderNumber || order._id}
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusClasses(
                  order.orderStatus,
                )}`}
              >
                {order.orderStatus || "UNKNOWN"}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${getPaymentStatusClasses(
                  order.paymentStatus,
                )}`}
              >
                Payment: {order.paymentStatus || "UNKNOWN"}
              </span>
            </div>
          </div>

          {/* Status Actions */}
          <div className="mt-6 flex flex-wrap gap-3 border-t border-neutral-200 pt-5">
            {nextStatus && (
              <button
                type="button"
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={actionLoading}
                className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading
                  ? "Updating..."
                  : `Move to ${nextStatus.replaceAll("_", " ")}`}
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={actionLoading}
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel Order
              </button>
            )}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">Customer</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Name
                </p>

                <p className="mt-1 font-medium text-neutral-900">
                  {order.user?.fullName || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Username
                </p>

                <p className="mt-1 text-sm text-neutral-700">
                  {order.user?.username || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm text-neutral-700">
                  {order.user?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Phone
                </p>

                <p className="mt-1 text-sm text-neutral-700">
                  {order.user?.phone || "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">Payment</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Method
                </p>

                <p className="mt-1 font-medium text-neutral-900">
                  {order.paymentMethod || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Status
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                    order.paymentStatus,
                  )}`}
                >
                  {order.paymentStatus || "UNKNOWN"}
                </span>
              </div>

              {order.paymentDetails && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Payment Details
                  </p>

                  <div className="mt-2 space-y-1 text-sm text-neutral-700">
                    {Object.entries(order.paymentDetails).map(
                      ([key, value]) => (
                        <p key={key}>
                          <span className="font-medium">{key}:</span>{" "}
                          {String(value)}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Shipping Address
            </h2>

            <p className="mt-5 text-sm leading-6 text-neutral-700">
              {formatAddress(order.shippingAddress)}
            </p>
          </section>
        </div>

        {/* Items */}
        <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-neutral-900">Order Items</h2>

            <p className="mt-1 text-sm text-neutral-500">
              {items.length} item
              {items.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">
                No items found.
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex flex-col gap-5 p-6 md:flex-row md:items-center"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product?.name || "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-neutral-900">
                      {item.product?.name || item.name || "Product"}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-500">
                      SKU: {item.product?.SKU || item.SKU || "N/A"}
                    </p>

                    {item.size && (
                      <p className="mt-1 text-sm text-neutral-500">
                        Size: {item.size}
                      </p>
                    )}

                    {item.color && (
                      <p className="mt-1 text-sm text-neutral-500">
                        Color: {item.color}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-sm md:text-right">
                    <div>
                      <p className="text-xs text-neutral-400">Price</p>

                      <p className="mt-1 font-semibold text-neutral-900">
                        ₹{item.price ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-400">Quantity</p>

                      <p className="mt-1 font-semibold text-neutral-900">
                        {item.quantity ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-400">Total</p>

                      <p className="mt-1 font-semibold text-neutral-900">
                        ₹{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Price Summary */}
        <section className="mt-6 flex justify-end">
          <div className="w-full rounded-2xl bg-white p-6 shadow-sm sm:max-w-md">
            <h2 className="text-lg font-bold text-neutral-900">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Subtotal</span>

                <span className="font-medium text-neutral-900">
                  ₹{order.subtotal ?? 0}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Discount</span>

                <span className="font-medium text-green-600">
                  -₹{order.discount ?? 0}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Shipping</span>

                <span className="font-medium text-neutral-900">
                  ₹{order.shipping ?? 0}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Tax</span>

                <span className="font-medium text-neutral-900">
                  ₹{order.tax ?? 0}
                </span>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between gap-4">
                  <span className="text-base font-bold text-neutral-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-neutral-900">
                    ₹{order.total ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation */}
        {order.cancellation && (
          <section className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-800">
              Cancellation Information
            </h2>

            <div className="mt-4 space-y-2 text-sm text-red-700">
              <p>
                <span className="font-semibold">Reason:</span>{" "}
                {order.cancellation.reason || "N/A"}
              </p>

              <p>
                <span className="font-semibold">Cancelled At:</span>{" "}
                {formatDate(order.cancellation.cancelledAt)}
              </p>

              <p>
                <span className="font-semibold">Cancelled By:</span>{" "}
                {order.cancellation.cancelledBy || "N/A"}
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default AdminOrderDetails;
