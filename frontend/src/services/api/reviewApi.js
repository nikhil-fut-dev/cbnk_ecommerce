import api from "./axios";

/*
 * Get approved reviews of a product.
 *
 * Public API
 */
export const getProductReviews = async (
  productId,
  { page = 1, limit = 10 } = {},
) => {
  const response = await api.get(`/reviews/product/${productId}`, {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

/*
 * Get reviews created by the logged-in customer.
 *
 * Protected API
 */
export const getMyReviews = async () => {
  const response = await api.get("/reviews/my");

  return response.data;
};

/*
 * Create a new product review.
 *
 * Backend requires:
 * - productId
 * - orderId
 * - rating
 * - optional title
 * - optional comment
 */
export const createReview = async ({
  productId,
  orderId,
  rating,
  title = "",
  comment = "",
}) => {
  const response = await api.post("/reviews", {
    productId,
    orderId,
    rating,
    title,
    comment,
  });

  return response.data;
};

/*
 * Update customer's own review.
 */
export const updateReview = async (
  reviewId,
  { rating, title = "", comment = "" },
) => {
  const response = await api.put(`/reviews/${reviewId}`, {
    rating,
    title,
    comment,
  });

  return response.data;
};

/*
 * Delete customer's own review.
 */
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);

  return response.data;
};
