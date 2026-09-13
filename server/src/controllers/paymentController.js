import mongoose from "mongoose";

import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";

import { createRazorpayOrder } from "../services/paymentService.js";

import { deductStock } from "../services/inventoryService.js";

import { verifyRazorpaySignature } from "../utils/razorpayUtils.js";

import { verifyRazorpayWebhookSignature } from "../utils/razorpayWebhook.js";

import { completePaidOrder } from "../services/completePaidOrder.js";

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
      const transactionPayment = await Payment.findById(payment._id).session(
        session,
      );

      if (!transactionPayment) {
        throw new Error("Payment record not found");
      }

      await completePaidOrder({
        orderId: order._id,
        userId: req.user._id,
        payment: transactionPayment,
        razorpayPaymentId,
        razorpaySignature,
        session,
      });
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

export const razorpayWebhook = async (req, res) => {
  console.log("🔔 Razorpay webhook received");
  try {
    const signature = req.headers["x-razorpay-signature"];

    const isValid = verifyRazorpayWebhookSignature({
      rawBody: req.rawBody,
      signature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = req.body?.event;

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "Webhook event is missing",
      });
    }

    /*
     * Razorpay sends different payload structures
     * for different events.
     */

    if (event === "payment.captured") {
      const razorpayPaymentId = payload.payment.entity.id;

      const payment = await Payment.findOne({
        razorpayOrderId: payload.payment.entity.order_id,
      });

      if (!payment) {
        return res.status(200).json({
          success: true,
          message: "Payment record not found, webhook acknowledged",
        });
      }

      if (payment.status === "CAPTURED") {
        return res.status(200).json({
          success: true,
          message: "Payment already captured",
        });
      }

      const order = await Order.findById(payment.order);

      if (!order) {
        return res.status(200).json({
          success: true,
          message: "Order not found, webhook acknowledged",
        });
      }

      const eventId =
        req.headers["x-razorpay-event-id"] ||
        `payment.captured:${razorpayPaymentId}`;

      if (payment.webhookEvents.includes(eventId)) {
        return res.status(200).json({
          success: true,
          message: "Webhook already processed",
        });
      }

      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const transactionPayment = await Payment.findById(
            payment._id,
          ).session(session);

          const transactionOrder = await Order.findById(order._id).session(
            session,
          );

          if (!transactionPayment || !transactionOrder) {
            throw new Error("Payment or order not found");
          }

          await completePaidOrder({
            orderId: transactionOrder._id,
            userId: transactionOrder.user,
            payment: transactionPayment,
            razorpayPaymentId,
            session,
          });

          transactionPayment.webhookEvents.push(eventId);

          await transactionPayment.save({ session });

          transactionOrder.paymentDetails =
            transactionOrder.paymentDetails || {};

          transactionOrder.paymentDetails.webhookEvents =
            transactionOrder.paymentDetails.webhookEvents || [];

          if (
            !transactionOrder.paymentDetails.webhookEvents.includes(eventId)
          ) {
            transactionOrder.paymentDetails.webhookEvents.push(eventId);
          }

          await transactionOrder.save({ session });
        });

        return res.status(200).json({
          success: true,
          message: "Payment captured and order completed",
        });
      } catch (error) {
        console.error("Payment captured webhook error:", error);

        return res.status(500).json({
          success: false,
          message: error.message || "Webhook processing failed",
        });
      } finally {
        await session.endSession();
      }
    }

    if (event === "payment.failed") {
      const paymentEntity = req.body?.payload?.payment?.entity;

      const razorpayPaymentId = paymentEntity?.id;

      const razorpayOrderId = paymentEntity?.order_id;

      const failureReason =
        paymentEntity?.error_description ||
        paymentEntity?.error_reason ||
        "Payment failed";

      if (!razorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: "Payment failure data is incomplete",
        });
      }

      const payment = await Payment.findOne({
        razorpayOrderId,
      });

      if (!payment) {
        return res.status(200).json({
          success: true,
          message: "Webhook received but payment record was not found",
        });
      }

      if (payment.webhookEvents.includes(event)) {
        return res.status(200).json({
          success: true,
          message: "Payment failure webhook already processed",
        });
      }

      payment.razorpayPaymentId = razorpayPaymentId || null;

      payment.status = "FAILED";

      payment.failureReason = failureReason;

      payment.webhookEvents.push(event);

      await payment.save();

      await Order.findByIdAndUpdate(payment.order, {
        $set: {
          paymentStatus: "FAILED",
        },
        $addToSet: {
          "paymentDetails.webhookEvents": event,
        },
      });

      console.log(`Payment failed: ${razorpayOrderId}`);
    }

    if (event === "refund.created") {
      const refundEntity = req.body?.payload?.refund?.entity;

      const razorpayPaymentId = refundEntity?.payment_id;

      const refundAmount = Number(refundEntity?.amount || 0) / 100;

      if (!razorpayPaymentId) {
        return res.status(400).json({
          success: false,
          message: "Refund webhook data is incomplete",
        });
      }

      const payment = await Payment.findOne({
        razorpayPaymentId,
      });

      if (!payment) {
        return res.status(200).json({
          success: true,
          message: "Refund received but payment record was not found",
        });
      }

      if (payment.webhookEvents.includes(event)) {
        return res.status(200).json({
          success: true,
          message: "Refund webhook already processed",
        });
      }

      payment.refundAmount = refundAmount;

      payment.refundId = refundEntity?.id || null;

      /*
       * If refund equals the complete payment
       * amount, mark it fully refunded.
       */
      if (refundAmount >= payment.amount) {
        payment.status = "REFUNDED";
      } else {
        payment.status = "PARTIALLY_REFUNDED";
      }

      payment.webhookEvents.push(event);

      await payment.save();

      await Order.findByIdAndUpdate(payment.order, {
        $set: {
          paymentStatus:
            payment.status === "REFUNDED" ? "REFUNDED" : "PARTIALLY_REFUNDED",
        },
        $addToSet: {
          "paymentDetails.webhookEvents": event,
        },
      });

      console.log(`Refund processed: ${refundEntity?.id}`);
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};
