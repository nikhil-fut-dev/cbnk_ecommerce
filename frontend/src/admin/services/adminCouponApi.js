import api from "../../services/api/axios";

// Get all admin coupons
export const getAdminCoupons = async ({
  search = "",
  status = "",
  page = 1,
  limit = 20,
} = {}) => {
  const response = await api.get("/admin/coupons", {
    params: {
      search,
      status,
      page,
      limit,
    },
  });

  return response.data;
};

// Get single coupon
export const getAdminCouponById = async (couponId) => {
  const response = await api.get(`/admin/coupons/${couponId}`);

  return response.data;
};

// Create coupon
export const createAdminCoupon = async (couponData) => {
  const response = await api.post("/admin/coupons", couponData);

  return response.data;
};

// Update coupon
export const updateAdminCoupon = async (couponId, couponData) => {
  const response = await api.put(`/admin/coupons/${couponId}`, couponData);

  return response.data;
};

// Activate / deactivate coupon
export const toggleAdminCouponStatus = async (couponId) => {
  const response = await api.patch(`/admin/coupons/${couponId}/status`);

  return response.data;
};

// Delete coupon
export const deleteAdminCoupon = async (couponId) => {
  const response = await api.delete(`/admin/coupons/${couponId}`);

  return response.data;
};
