import Coupon from "../models/Coupon.js";
import CouponUsage from "../models/CouponUsage.js";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 79;
const TAX_RATE = 0;

/*
|--------------------------------------------------------------------------
| Shipping
|--------------------------------------------------------------------------
*/

export const calculateShippingFee = (subtotal) => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return SHIPPING_FEE;
};

/*
|--------------------------------------------------------------------------
| Coupon Discount
|--------------------------------------------------------------------------
*/

export const calculateCouponDiscount = async ({
  code,
  userId,
  subtotal,
  items = [],
}) => {
  if (!code) {
    return {
      coupon: null,
      discount: 0,
    };
  }

  const normalizedCode = code.trim().toUpperCase();

  const coupon = await Coupon.findOne({
    code: normalizedCode,
    isActive: true,
  });

  if (!coupon) {
    throw new Error("Invalid or inactive coupon");
  }

  const now = new Date();

  if (coupon.startDate && now < coupon.startDate) {
    throw new Error("Coupon is not active yet");
  }

  if (coupon.expiryDate && now > coupon.expiryDate) {
    throw new Error("Coupon has expired");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  if (coupon.minimumOrderValue > 0 && subtotal < coupon.minimumOrderValue) {
    throw new Error(
      `Minimum order value for this coupon is ₹${coupon.minimumOrderValue}`,
    );
  }

  if (
    coupon.maximumOrderValue !== null &&
    subtotal > coupon.maximumOrderValue
  ) {
    throw new Error(
      `Maximum order value for this coupon is ₹${coupon.maximumOrderValue}`,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Per User Usage
  |--------------------------------------------------------------------------
  */

  if (userId && coupon.perUserLimit) {
    const userUsageCount = await CouponUsage.countDocuments({
      coupon: coupon._id,
      user: userId,
    });

    if (userUsageCount >= coupon.perUserLimit) {
      throw new Error(
        "You have already reached the usage limit for this coupon",
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Applicable Products
  |--------------------------------------------------------------------------
  */

  let eligibleSubtotal = subtotal;

  const hasProductRestriction = coupon.applicableProducts?.length > 0;

  const hasCategoryRestriction = coupon.applicableCategories?.length > 0;

  if (hasProductRestriction || hasCategoryRestriction) {
    eligibleSubtotal = items.reduce((total, item) => {
      const productEligible =
        hasProductRestriction &&
        coupon.applicableProducts.some(
          (productId) => productId.toString() === item.product.toString(),
        );

      const categoryEligible =
        hasCategoryRestriction &&
        item.category &&
        coupon.applicableCategories.some(
          (categoryId) => categoryId.toString() === item.category.toString(),
        );

      if (!productEligible && !categoryEligible) {
        return total;
      }

      return total + item.price * item.quantity;
    }, 0);
  }

  if (eligibleSubtotal <= 0) {
    throw new Error("Coupon is not applicable to the selected products");
  }

  /*
  |--------------------------------------------------------------------------
  | Calculate Discount
  |--------------------------------------------------------------------------
  */

  let discount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discount = (eligibleSubtotal * coupon.discountValue) / 100;

    if (coupon.maxDiscount !== null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  if (coupon.discountType === "FIXED") {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, eligibleSubtotal, subtotal);

  discount = Math.max(Number(discount.toFixed(2)), 0);

  return {
    coupon,
    discount,
  };
};

/*
|--------------------------------------------------------------------------
| Tax
|--------------------------------------------------------------------------
*/

export const calculateTax = (taxableAmount) => {
  return Number(((taxableAmount * TAX_RATE) / 100).toFixed(2));
};

/*
|--------------------------------------------------------------------------
| Complete Order Pricing
|--------------------------------------------------------------------------
*/

export const calculateOrderPricing = async ({
  items,
  userId,
  couponCode = null,
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty");
  }

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const roundedSubtotal = Number(subtotal.toFixed(2));

  let coupon = null;
  let discount = 0;

  if (couponCode) {
    const couponResult = await calculateCouponDiscount({
      code: couponCode,
      userId,
      subtotal: roundedSubtotal,
      items,
    });

    coupon = couponResult.coupon;
    discount = couponResult.discount;
  }

  const taxableAmount = Math.max(roundedSubtotal - discount, 0);

  const tax = calculateTax(taxableAmount);

  const shippingFee = calculateShippingFee(taxableAmount);

  const total = Number((taxableAmount + tax + shippingFee).toFixed(2));

  return {
    subtotal: roundedSubtotal,
    discount,
    shippingFee,
    tax,
    total,
    coupon,
  };
};
