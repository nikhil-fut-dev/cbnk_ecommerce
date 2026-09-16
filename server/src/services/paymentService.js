import razorpay from "../config/razorpay.js";
import Payment from "../models/Payment.js";

export const createRazorpayOrder = async ({ order, user }) => {
  if (!order || !user) {
    throw new Error("Order and user are required");
  }

  if (order.user.toString() !== user._id.toString()) {
    throw new Error("Order does not belong to this user");
  }

  if (order.orderStatus === "CANCELLED") {
    throw new Error("Cancelled order cannot be paid");
  }

  if (order.paymentMethod !== "RAZORPAY") {
    throw new Error("This order is not configured for Razorpay");
  }

  if (!Number.isFinite(order.total) || order.total <= 0) {
    throw new Error("Invalid order total");
  }

  // Reuse an existing active Razorpay payment if available.
  const existingPayment = await Payment.findOne({
    order: order._id,
    user: user._id,
    provider: "RAZORPAY",
    status: {
      $in: ["CREATED", "AUTHORIZED"],
    },
  }).sort({ createdAt: -1 });

  if (existingPayment?.razorpayOrderId) {
    return {
      razorpayOrder: {
        id: existingPayment.razorpayOrderId,
        amount: Math.round(existingPayment.amount * 100),
        currency: existingPayment.currency,
        receipt: order.orderNumber,
      },
      payment: existingPayment,
    };
  }

  const amountInPaise = Math.round(order.total * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
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
