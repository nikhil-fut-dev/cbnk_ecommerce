import razorpay from "../config/razorpay.js";
import Payment from "../models/Payment.js";

export const createRazorpayOrder = async ({ order, user }) => {
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100),
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      orderId: order._id.toString(),
      userId: user._id.toString(),
    },
  });

  const payment = await Payment.create({
    order: order._id,
    user: user._id,
    provider: "RAZORPAY",
    razorpayOrderId: razorpayOrder.id,
    amount: order.total,
    currency: "INR",
    status: "CREATED",
  });

  return {
    razorpayOrder,
    payment,
  };
};
