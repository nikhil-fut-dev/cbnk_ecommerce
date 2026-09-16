import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getMyReviews,
  updateReview,
  deleteReview,
} from "../../services/api/reviewApi";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const [editForm, setEditForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await getMyReviews();

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load reviews");
      }

      setReviews(response.data || []);
    } catch (error) {
      console.error("Load reviews error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load reviews",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "-";

    return status.replaceAll("_", " ");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const startEditing = (review) => {
    setEditingReviewId(review._id);

    setEditForm({
      rating: Number(review.rating || 5),
      title: review.title || "",
      comment: review.comment || "",
    });
  };

  const cancelEditing = () => {
    setEditingReviewId(null);

    setEditForm({
      rating: 5,
      title: "",
      comment: "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateReview = async (reviewId) => {
    if (
      !editForm.rating ||
      Number(editForm.rating) < 1 ||
      Number(editForm.rating) > 5
    ) {
      toast.error("Please select a rating between 1 and 5.");
      return;
    }

    try {
      setSavingReview(true);

      const response = await updateReview(reviewId, {
        rating: Number(editForm.rating),
        title: editForm.title.trim(),
        comment: editForm.comment.trim(),
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update review");
      }

      toast.success(
        response.message ||
          "Review updated successfully and sent for approval.",
      );

      cancelEditing();

      await loadReviews();
    } catch (error) {
      console.error("Update review error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update review",
      );
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) return;

    try {
      setDeletingReviewId(reviewId);

      const response = await deleteReview(reviewId);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to delete review");
      }

      toast.success(response.message || "Review deleted successfully.");

      setReviews((prev) => prev.filter((review) => review._id !== reviewId));
    } catch (error) {
      console.error("Delete review error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete review",
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse space-y-5">
          <div className="h-8 w-52 rounded bg-gray-200" />

          <div className="h-48 rounded-2xl bg-gray-200" />

          <div className="h-48 rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/account"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to Account
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              My Reviews
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage the reviews you have submitted for your purchases.
            </p>
          </div>
        </div>

        {/* Empty State */}
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">⭐</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              No reviews yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Reviews you submit for delivered orders will appear here.
            </p>

            <Link
              to="/account/orders"
              className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              View Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => {
              const product = review.product;
              const order = review.order;

              const isEditing = editingReviewId === review._id;
              const isDeleting = deletingReviewId === review._id;

              return (
                <div
                  key={review._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* Product Header */}
                  <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      {product?.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name || "Product"}
                          className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                          No Image
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-gray-900">
                          {product?.name || "Product"}
                        </h2>

                        {order?.orderNumber && (
                          <p className="mt-1 text-xs text-gray-500">
                            Order: {order.orderNumber}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-gray-500">
                          Reviewed on {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                        review.status,
                      )}`}
                    >
                      {formatStatus(review.status)}
                    </span>
                  </div>

                  {/* Review */}
                  <div className="p-5">
                    {isEditing ? (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Edit Review
                        </h3>

                        {/* Rating */}
                        <div className="mt-4 flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleEditChange("rating", star)}
                              className="text-2xl transition hover:scale-110"
                              aria-label={`Rate ${star} out of 5`}
                            >
                              <span
                                className={
                                  star <= Number(editForm.rating)
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
                          value={editForm.title}
                          onChange={(event) =>
                            handleEditChange("title", event.target.value)
                          }
                          placeholder="Review title"
                          maxLength={150}
                          className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                        />

                        <textarea
                          value={editForm.comment}
                          onChange={(event) =>
                            handleEditChange("comment", event.target.value)
                          }
                          placeholder="Share your experience..."
                          maxLength={2000}
                          rows={5}
                          className="mt-3 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                        />

                        <div className="mt-4 flex flex-wrap justify-end gap-3">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={savingReview}
                            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateReview(review._id)}
                            disabled={savingReview}
                            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingReview ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Rating */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xl tracking-wide text-amber-500">
                            {"★".repeat(Number(review.rating || 0))}
                            {"☆".repeat(5 - Number(review.rating || 0))}
                          </div>

                          {review.isVerifiedPurchase && (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>

                        {review.title && (
                          <h3 className="mt-4 font-semibold text-gray-900">
                            {review.title}
                          </h3>
                        )}

                        {review.comment && (
                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            {review.comment}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => startEditing(review)}
                            disabled={isDeleting}
                            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                          >
                            Edit Review
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review._id)}
                            disabled={isDeleting}
                            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? "Deleting..." : "Delete Review"}
                          </button>
                        </div>

                        {review.status === "REJECTED" && review.adminNote && (
                          <div className="mt-4 rounded-xl bg-red-50 p-4">
                            <p className="text-xs font-semibold text-red-700">
                              Admin Note
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                              {review.adminNote}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
