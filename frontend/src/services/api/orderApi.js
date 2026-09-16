import api from "./axios";

/*
 * Create a new order
 */
export const createOrder = async ({
  addressId,
  paymentMethod = "RAZORPAY",
  couponCode = null,
}) => {
  const response = await api.post("/orders", {
    addressId,
    paymentMethod,
    couponCode,
  });

  return response.data;
};

/*
 * Get logged-in user's orders
 */
export const getMyOrders = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get("/orders", {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

/*
 * Get single order
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);

  return response.data;
};

/*
 * Cancel order
 */
export const cancelOrder = async (
  orderId,
  reason = "Order cancelled by customer",
) => {
  const response = await api.patch(`/orders/${orderId}/cancel`, {
    reason,
  });

  return response.data;
};
