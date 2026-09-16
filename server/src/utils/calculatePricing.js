export const calculateCouponDiscount = ({ coupon, subtotal }) => {
  if (!coupon) {
    return 0;
  }

  let discount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discount = (subtotal * coupon.discountValue) / 100;

    if (coupon.maxDiscount !== null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  if (coupon.discountType === "FIXED") {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, subtotal);

  return Math.max(0, Number(discount.toFixed(2)));
};

export const calculateShippingFee = (subtotal) => {
  return subtotal >= 999 ? 0 : 0;
};

export const calculateOrderPricing = ({ subtotal, coupon = null }) => {
  const discount = calculateCouponDiscount({
    coupon,
    subtotal,
  });

  const taxableAmount = Math.max(0, subtotal - discount);

  // GST/tax engine can be added later.
  const tax = 0;

  const shippingFee = taxableAmount >= 999 ? 0 : 0;

  const total = taxableAmount + shippingFee + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    shippingFee: Number(shippingFee.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};
