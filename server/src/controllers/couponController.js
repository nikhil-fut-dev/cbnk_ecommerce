import { calculateCouponDiscount } from "../services/calculatePricing.js";

export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal, items = [] } = req.body;

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

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart items",
      });
    }

    const { coupon, discount } = await calculateCouponDiscount({
      code,
      userId: req.user._id,
      subtotal: parsedSubtotal,
      items,
    });

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: Number(discount.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to validate coupon",
    });
  }
};
