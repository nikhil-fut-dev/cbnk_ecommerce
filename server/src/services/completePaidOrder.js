import Coupon from "../models/Coupon.js";
import CouponUsage from "../models/CouponUsage.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

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

    const now = new Date();

    if (coupon.startDate && now < coupon.startDate) {
      throw new Error("Coupon is not active");
    }

    if (coupon.expiryDate && now > coupon.expiryDate) {
      throw new Error("Coupon has expired");
    }

    const userUsageCount = await CouponUsage.countDocuments({
      coupon: coupon._id,
      user: userId,
    }).session(session);

    if (userUsageCount >= coupon.perUserLimit) {
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
  }

  /*
   * 3. Update payment.
   */
  if (payment) {
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
