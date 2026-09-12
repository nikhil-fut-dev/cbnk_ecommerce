import Coupon from "../models/Coupon.js";
import CouponUsage from "../models/CouponUsage.js";

const getActiveCoupon = async (code) => {
  const now = new Date();

  return Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
    startDate: { $lte: now },
    expiryDate: { $gte: now },
  });
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const parsedSubtotal = Number(subtotal);

    if (Number.isNaN(parsedSubtotal) || parsedSubtotal < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid subtotal",
      });
    }

    const coupon = await getActiveCoupon(code);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired coupon",
      });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit has been reached",
      });
    }

    if (parsedSubtotal < coupon.minimumOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is ₹${coupon.minimumOrderValue}`,
      });
    }

    if (
      coupon.maximumOrderValue !== null &&
      parsedSubtotal > coupon.maximumOrderValue
    ) {
      return res.status(400).json({
        success: false,
        message: `Maximum order value is ₹${coupon.maximumOrderValue}`,
      });
    }

    const userUsageCount = await CouponUsage.countDocuments({
      coupon: coupon._id,
      user: req.user._id,
    });

    if (userUsageCount >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: "You have already used this coupon",
      });
    }

    let discount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discount = (parsedSubtotal * coupon.discountValue) / 100;

      if (coupon.maxDiscount !== null) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, parsedSubtotal);

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: Number(discount.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
    });
  }
};
