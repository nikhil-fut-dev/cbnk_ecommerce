import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getOrderById, cancelOrder } from "../../services/api/orderApi";

import { createReview, getMyReviews } from "../../services/api/reviewApi";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelling, setCancelling] = useState(false);

  const [myReviews, setMyReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState({});
  const [reviewForm, setReviewForm] = useState({});

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrderById(id);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load order");
      }

      setOrder(response.order);
    } catch (error) {
      console.error("Load order details error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load order";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  useEffect(() => {
    const loadMyReviews = async () => {
      try {
        setReviewLoading(true);

        const response = await getMyReviews();

        if (!response?.success) {
          throw new Error(response?.message || "Failed to load reviews");
        }

        setMyReviews(response.data || []);
      } catch (error) {
        console.error("Load my reviews error:", error);
      } finally {
        setReviewLoading(false);
      }
    };

    loadMyReviews();
  }, []);

  const handleCancelOrder = async () => {
    if (!order?._id) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    try {
      setCancelling(true);

      const response = await cancelOrder(
        order._id,
        "Order cancelled by customer",
      );

      if (!response?.success) {
        throw new Error(response?.message || "Failed to cancel order");
      }

      toast.success(response.message || "Order cancelled successfully");

      await loadOrder();
    } catch (error) {
      console.error("Cancel order error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to cancel order",
      );
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "-";

    return status.replaceAll("_", " ");
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

  const canCancel = ["PENDING", "CONFIRMED", "PROCESSING"].includes(
    order?.orderStatus,
  );

  const getItemProductId = (item) => {
    if (!item?.product) return "";

    return typeof item.product === "object"
      ? item.product._id?.toString()
      : item.product.toString();
  };

  const getExistingReview = (item) => {
    const productId = getItemProductId(item);

    return myReviews.find(
      (review) =>
        review?.product?._id?.toString() === productId &&
        review?.order?._id?.toString() === order?._id?.toString(),
    );
  };

  const getReviewForm = (item) => {
    const productId = getItemProductId(item);

    return (
      reviewForm[productId] || {
        rating: 5,
        title: "",
        comment: "",
      }
    );
  };

  const updateReviewForm = (item, field, value) => {
    const productId = getItemProductId(item);

    setReviewForm((prev) => ({
      ...prev,
      [productId]: {
        ...getReviewForm(item),
        [field]: value,
      },
    }));
  };

  const handleSubmitReview = async (item) => {
    if (!order?._id || order.orderStatus !== "DELIVERED") {
      return;
    }

    const productId = getItemProductId(item);

    if (!productId) {
      toast.error("Product information is missing.");
      return;
    }

    const existingReview = getExistingReview(item);

    if (existingReview) {
      toast.error("You have already reviewed this product for this order.");
      return;
    }

    const form = getReviewForm(item);

    if (!form.rating || Number(form.rating) < 1 || Number(form.rating) > 5) {
      toast.error("Please select a rating between 1 and 5.");
      return;
    }

    try {
      setReviewSubmitting((prev) => ({
        ...prev,
        [productId]: true,
      }));

      const response = await createReview({
        productId,
        orderId: order._id,
        rating: Number(form.rating),
        title: form.title.trim(),
        comment: form.comment.trim(),
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to submit review");
      }

      toast.success(
        response.message ||
          "Review submitted successfully. It is pending approval.",
      );

      setMyReviews((prev) => [response.data || response.review, ...prev]);

      setReviewForm((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (error) {
      console.error("Submit review error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit review",
      );
    } finally {
      setReviewSubmitting((prev) => ({
        ...prev,
        [productId]: false,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-8 w-52 rounded bg-gray-200" />
          <div className="h-40 rounded-2xl bg-gray-200" />
          <div className="h-80 rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">📦</div>

          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Order not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Unable to find this order."}
          </p>

          <Link
            to="/account/orders"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/account/orders"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to Orders
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Order Number
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                {order.orderNumber}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                order.orderStatus,
              )}`}
            >
              {formatStatus(order.orderStatus)}
            </span>
          </div>
        </div>

        {/* Order Status / Payment */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">Order Status</p>

            <p className="mt-2 font-semibold text-gray-900">
              {formatStatus(order.orderStatus)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">Payment Status</p>

            <p className="mt-2 font-semibold text-gray-900">
              {formatStatus(order.paymentStatus)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">Payment Method</p>

            <p className="mt-2 font-semibold text-gray-900">
              {order.paymentMethod || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">Total Amount</p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              ₹{Number(order.total || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Products */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Ordered Items
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {order.items?.length || 0} item(s)
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items?.map((item, index) => (
                  <div
                    key={`${item.product}-${index}`}
                    className="flex gap-4 p-5"
                  >
                    {/* Image */}
                    {item.image?.url ? (
                      <img
                        src={item.image.url}
                        alt={item.name}
                        className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28"
                      />
                    ) : (
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400 sm:h-28 sm:w-28">
                        No Image
                      </div>
                    )}

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>

                      {item.SKU && (
                        <p className="mt-1 text-xs text-gray-500">
                          SKU: {item.SKU}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {item.size && (
                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-gray-600">
                            Size: {item.size}
                          </span>
                        )}

                        {item.color && (
                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-gray-600">
                            Color: {item.color}
                          </span>
                        )}

                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-gray-600">
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-gray-500">
                          ₹{Number(item.price || 0).toFixed(2)} ×{" "}
                          {item.quantity}
                        </p>

                        <p className="font-bold text-gray-900">
                          ₹{Number(item.total || 0).toFixed(2)}
                        </p>
                      </div>

                      {order.orderStatus === "DELIVERED" && (
                        <div className="mt-5 border-t border-gray-100 pt-5">
                          {(() => {
                            const existingReview = getExistingReview(item);
                            const form = getReviewForm(item);
                            const productId = getItemProductId(item);
                            const submitting = Boolean(
                              reviewSubmitting[productId],
                            );

                            if (existingReview) {
                              return (
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        Review Submitted
                                      </p>

                                      <p className="mt-1 text-xs text-gray-500">
                                        Status:{" "}
                                        {existingReview.status || "PENDING"}
                                      </p>
                                    </div>

                                    <div className="text-sm tracking-wide text-amber-500">
                                      {"★".repeat(
                                        Number(existingReview.rating || 0),
                                      )}
                                      {"☆".repeat(
                                        5 - Number(existingReview.rating || 0),
                                      )}
                                    </div>
                                  </div>

                                  {existingReview.title && (
                                    <p className="mt-3 text-sm font-semibold text-gray-900">
                                      {existingReview.title}
                                    </p>
                                  )}

                                  {existingReview.comment && (
                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                      {existingReview.comment}
                                    </p>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <p className="text-sm font-semibold text-gray-900">
                                  Rate this product
                                </p>

                                <div className="mt-4 flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() =>
                                        updateReviewForm(item, "rating", star)
                                      }
                                      className="text-2xl transition hover:scale-110"
                                      aria-label={`Rate ${star} out of 5`}
                                    >
                                      <span
                                        className={
                                          star <= Number(form.rating)
                                            ? "text-amber-500"
                                            : "text-gray-300"
                                        }
                                      >
                                        ★
                                      </span>
                                    </button>
                                  ))}
                                </div>

                                <input
                                  type="text"
                                  value={form.title}
                                  onChange={(event) =>
                                    updateReviewForm(
                                      item,
                                      "title",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Review title (optional)"
                                  maxLength={150}
                                  className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                                />

                                <textarea
                                  value={form.comment}
                                  onChange={(event) =>
                                    updateReviewForm(
                                      item,
                                      "comment",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Share your experience with this product..."
                                  maxLength={2000}
                                  rows={4}
                                  className="mt-3 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                                />

                                <div className="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleSubmitReview(item)}
                                    disabled={submitting || reviewLoading}
                                    className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {submitting
                                      ? "Submitting..."
                                      : "Submit Review"}
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Shipping Address
              </h2>

              {order.shippingAddress && (
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">
                    {order.shippingAddress.fullName}
                  </p>

                  <p className="mt-1">{order.shippingAddress.phone}</p>

                  <p className="mt-3">{order.shippingAddress.addressLine1}</p>

                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}

                  {order.shippingAddress.landmark && (
                    <p>Landmark: {order.shippingAddress.landmark}</p>
                  )}

                  <p className="mt-1">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>

                  <p className="mt-1">{order.shippingAddress.country}</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Price Summary</h2>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Subtotal</span>

                  <span className="font-medium text-gray-900">
                    ₹{Number(order.subtotal || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Discount</span>

                  <span className="font-medium text-green-600">
                    - ₹{Number(order.discount || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Shipping</span>

                  <span className="font-medium text-gray-900">
                    ₹{Number(order.shippingFee || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Tax</span>

                  <span className="font-medium text-gray-900">
                    ₹{Number(order.tax || 0).toFixed(2)}
                  </span>
                </div>

                {order.coupon?.code && (
                  <div className="rounded-xl bg-green-50 p-3">
                    <p className="text-xs text-green-600">Coupon Applied</p>

                    <p className="mt-1 font-semibold text-green-700">
                      {order.coupon.code}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-gray-900">Total</span>

                    <span className="text-xl font-bold text-gray-900">
                      ₹{Number(order.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel */}
            {canCancel && (
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="mt-4 w-full rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
