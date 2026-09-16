import api from "./axios";

export const createRazorpayOrder = async (orderId) => {
  const response = await api.post("/payments/razorpay/create-order", {
    orderId,
  });

  return response.data;
};

export const verifyRazorpayPayment = async ({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const response = await api.post("/payments/razorpay/verify", {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  return response.data;
};
