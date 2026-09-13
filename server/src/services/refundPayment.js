import Razorpay from "razorpay";

import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const refundPayment = async ({
  orderId,
  userId,
  amount = null,
  reason = "Order cancelled",
  session,
}) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).session(session);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentStatus !== "PAID") {
    throw new Error("Paid payment is required for refund");
  }

  const payment = await Payment.findOne({
    order: order._id,
  }).session(session);

  if (!payment || !payment.razorpayPaymentId) {
    throw new Error("Razorpay payment not found");
  }

  if (
    payment.status === "REFUNDED" ||
    payment.status === "PARTIALLY_REFUNDED"
  ) {
    return {
      order,
      payment,
      alreadyRefunded: true,
    };
  }

  const refundAmount = amount === null ? Number(order.total) : Number(amount);

  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    throw new Error("Invalid refund amount");
  }

  if (refundAmount > Number(order.total)) {
    throw new Error("Refund amount cannot exceed order total");
  }

  const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    amount: Math.round(refundAmount * 100),
    notes: {
      orderId: order._id.toString(),
      reason,
    },
  });

  payment.refundAmount = Number(payment.refundAmount || 0) + refundAmount;

  payment.refundId = refund.id;

  if (payment.refundAmount >= Number(order.total)) {
    payment.status = "REFUNDED";
    order.paymentStatus = "REFUNDED";
  } else {
    payment.status = "PARTIALLY_REFUNDED";
    order.paymentStatus = "PARTIALLY_REFUNDED";
  }

  await payment.save({ session });
  await order.save({ session });

  return {
    order,
    payment,
    refund,
    alreadyRefunded: false,
  };
};
