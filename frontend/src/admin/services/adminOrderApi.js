import api from "../../services/api/axios";

// Get all admin orders
export const getAdminOrders = async ({
  page = 1,
  limit = 20,
  search = "",
  status = "",
  paymentStatus = "",
  paymentMethod = "",
  startDate = "",
  endDate = "",
} = {}) => {
  const response = await api.get("/admin/orders", {
    params: {
      page,
      limit,
      search,
      status,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
    },
  });

  return response.data;
};

// Get single admin order
export const getAdminOrderById = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}`);

  return response.data;
};

// Update order status
export const updateAdminOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/admin/orders/${orderId}/status`, {
    status,
  });

  return response.data;
};

// Cancel order
export const cancelAdminOrder = async (
  orderId,
  reason = "Order cancelled by admin",
) => {
  const response = await api.patch(`/admin/orders/${orderId}/cancel`, {
    reason,
  });

  return response.data;
};
