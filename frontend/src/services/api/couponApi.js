import api from "./axios";

export const validateCoupon = async ({ code, subtotal, items = [] }) => {
  const response = await api.post("/coupons/validate", {
    code,
    subtotal,
    items,
  });

  return response.data;
};
