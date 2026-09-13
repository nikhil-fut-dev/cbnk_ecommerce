import mongoose from "mongoose";

import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Cart from "../models/Cart.js";

import { createRazorpayOrder } from "../services/paymentService.js";

import { deductStock } from "../services/inventoryService.js";

import { verifyRazorpaySignature } from "../utils/razorpayUtils.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be paid",
      });
    }

    const existingPayment = await Payment.findOne({
      order: order._id,
      status: "CREATED",
    });

    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: "Payment order already exists",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          razorpayOrderId: existingPayment.razorpayOrderId,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      });
    }

    const { razorpayOrder, payment } = await createRazorpayOrder({
      order,
      user: req.user,
    });

    order.paymentDetails.razorpayOrderId = razorpayOrder.id;

    await order.save();

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        razorpayOrderId: razorpayOrder.id,
        paymentId: payment._id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    if (
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Order is already paid",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        },
      });
    }

    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be paid",
      });
    }

    const payment = await Payment.findOne({
      order: order._id,
      razorpayOrderId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    if (
      payment.status === "CAPTURED" ||
      payment.status === "REFUNDED" ||
      payment.status === "PARTIALLY_REFUNDED"
    ) {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        },
      });
    }

    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      payment.status = "FAILED";
      payment.failureReason = "Invalid payment signature";

      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    await session.withTransaction(async () => {
      const transactionOrder = await Order.findOne({
        _id: order._id,
        user: req.user._id,
      }).session(session);

      if (!transactionOrder) {
        throw new Error("Order not found");
      }

      if (transactionOrder.paymentStatus === "PAID") {
        return;
      }

      /*
       * Deduct inventory for every order item.
       */
      for (const item of transactionOrder.items) {
        await deductStock({
          productId: item.product,
          variantId: item.variant || null,
          quantity: item.quantity,
          session,
        });
      }

      /*
       * Update payment.
       */
      payment.razorpayPaymentId = razorpayPaymentId;

      payment.razorpaySignature = razorpaySignature;

      payment.status = "CAPTURED";
      payment.paidAt = new Date();

      await payment.save({
        session,
      });

      /*
       * Update order.
       */
      transactionOrder.paymentStatus = "PAID";

      transactionOrder.orderStatus = "CONFIRMED";

      transactionOrder.paymentDetails.razorpayPaymentId = razorpayPaymentId;

      transactionOrder.paymentDetails.razorpaySignature = razorpaySignature;

      await transactionOrder.save({
        session,
      });

      /*
       * Clear user's cart only after
       * successful payment + stock deduction.
       */
      await Cart.findOneAndUpdate(
        {
          user: req.user._id,
        },
        {
          $set: {
            items: [],
          },
        },
        {
          session,
        },
      );
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed successfully",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  } finally {
    await session.endSession();
  }
};
