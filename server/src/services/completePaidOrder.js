import Coupon from "../models/Coupon.js";
import CouponUsage from "../models/CouponUsage.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

import { deductStock } from "./inventoryService.js";

export const completePaidOrder = async ({
  orderId,
  userId,
  payment,
  razorpayPaymentId,
  razorpaySignature = "",
  session,
}) => {
  const transactionOrder = await Order.findOne({
    _id: orderId,
    user: userId,
  }).session(session);

  if (!transactionOrder) {
    throw new Error("Order not found");
  }

  /*
   * Already completed.
   * This makes the operation idempotent.
   */
  if (transactionOrder.paymentStatus === "PAID") {
    return transactionOrder;
  }

  if (transactionOrder.orderStatus === "CANCELLED") {
    throw new Error("Cancelled order cannot be completed");
  }

  if (!payment) {
    throw new Error("Payment record is required");
  }

  if (payment && payment.order.toString() !== transactionOrder._id.toString()) {
    throw new Error("Payment does not belong to this order");
  }

  if (payment && payment.user.toString() !== transactionOrder.user.toString()) {
    throw new Error("Payment does not belong to this user");
  }

  if (payment) {
    if (Number(payment.amount) !== Number(transactionOrder.total)) {
      throw new Error("Payment amount does not match order total");
    }

    if (payment.currency !== "INR") {
      throw new Error("Invalid payment currency");
    }
  }

  /*
   * 1. Deduct inventory.
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
   * 2. Consume coupon.
   */
  if (transactionOrder.coupon?.code) {
    const coupon = await Coupon.findOne({
      code: transactionOrder.coupon.code,
      isActive: true,
    }).session(session);

    if (!coupon) {
      throw new Error("Coupon is no longer available");
    }

    /*
     * Check whether this exact order has
     * already consumed this coupon.
     *
     * This protects against duplicate payment
     * verification / webhook processing.
     */
    const existingCouponUsage = await CouponUsage.findOne({
      coupon: coupon._id,
      order: transactionOrder._id,
    }).session(session);

    if (!existingCouponUsage) {
      const now = new Date();

      if (coupon.startDate && now < coupon.startDate) {
        throw new Error("Coupon is not active");
      }

      if (coupon.expiryDate && now > coupon.expiryDate) {
        throw new Error("Coupon has expired");
      }

      /*
       * Check per-user usage limit.
       */
      const userUsageCount = await CouponUsage.countDocuments({
        coupon: coupon._id,
        user: userId,
      }).session(session);

      if (
        coupon.perUserLimit !== null &&
        userUsageCount >= coupon.perUserLimit
      ) {
        throw new Error("You have reached the usage limit for this coupon");
      }

      /*
       * Atomically increment global coupon usage.
       */
      const couponFilter = {
        _id: coupon._id,
        isActive: true,
      };

      if (coupon.usageLimit !== null) {
        couponFilter.usedCount = {
          $lt: coupon.usageLimit,
        };
      }

      const updatedCoupon = await Coupon.findOneAndUpdate(
        couponFilter,
        {
          $inc: {
            usedCount: 1,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!updatedCoupon) {
        throw new Error("Coupon usage limit has been reached");
      }

      /*
       * Record this customer's coupon usage.
       */
      try {
        await CouponUsage.create(
          [
            {
              coupon: coupon._id,
              user: userId,
              order: transactionOrder._id,
              discountAmount: transactionOrder.coupon.discount,
            },
          ],
          { session },
        );
      } catch (error) {
        /*
         * The compound unique index on
         * { coupon, order } protects against
         * duplicate usage records.
         */
        if (error?.code === 11000) {
          throw new Error("Coupon has already been applied to this order");
        }

        throw error;
      }
    }
  }

  /*
   * 3. Update payment.
   */
  if (payment) {
    if (
      payment.status === "REFUNDED" ||
      payment.status === "PARTIALLY_REFUNDED"
    ) {
      throw new Error("Refunded payment cannot be completed");
    }

    if (
      payment.razorpayPaymentId &&
      razorpayPaymentId &&
      payment.razorpayPaymentId !== razorpayPaymentId
    ) {
      throw new Error("Payment ID does not match existing payment record");
    }

    payment.razorpayPaymentId =
      razorpayPaymentId || payment.razorpayPaymentId || null;

    if (razorpaySignature) {
      payment.razorpaySignature = razorpaySignature;
    }

    payment.status = "CAPTURED";
    payment.paidAt = payment.paidAt || new Date();

    await payment.save({
      session,
    });
  }

  /*
   * 4. Update order.
   */
  transactionOrder.paymentStatus = "PAID";
  transactionOrder.orderStatus = "CONFIRMED";

  transactionOrder.paymentDetails = transactionOrder.paymentDetails || {};

  if (razorpayPaymentId) {
    transactionOrder.paymentDetails.razorpayPaymentId = razorpayPaymentId;
  }

  if (razorpaySignature) {
    transactionOrder.paymentDetails.razorpaySignature = razorpaySignature;
  }

  await transactionOrder.save({
    session,
  });

  /*
   * 5. Clear cart only after
   *    payment + inventory + coupon succeed.
   */
  await Cart.findOneAndUpdate(
    {
      user: userId,
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

  return transactionOrder;
};
