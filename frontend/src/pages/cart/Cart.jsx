import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Tag,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../../services/api/cartApi";

import { validateCoupon } from "../../services/api/couponApi";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingItem, setUpdatingItem] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCart();

      if (response?.success) {
        setCart(response.cart);
      } else {
        setError(response?.message || "Unable to load cart.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load cart. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    try {
      setUpdatingItem(itemId);

      const response = await updateCartItem(itemId, quantity);

      if (response?.success) {
        setCart(response.cart);

        // Cart changed, so previously applied coupon must be
        // validated again against the new subtotal.
        if (appliedCoupon) {
          setAppliedCoupon(null);
          setCouponDiscount(0);
          setCouponCode("");
          toast("Coupon removed because cart quantity changed.");
        }
      } else {
        toast.error(response?.message || "Unable to update cart.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to update cart item.",
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setUpdatingItem(itemId);

      const response = await removeCartItem(itemId);

      if (response?.success) {
        setCart(response.cart);

        if (appliedCoupon) {
          setAppliedCoupon(null);
          setCouponDiscount(0);
          setCouponCode("");
          toast("Coupon removed because cart changed.");
        }
      } else {
        toast.error(response?.message || "Unable to remove item.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to remove cart item.",
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearingCart(true);

      const response = await clearCart();

      if (response?.success) {
        setCart(response.cart || { items: [] });

        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode("");

        toast.success("Cart cleared successfully.");
      } else {
        toast.error(response?.message || "Unable to clear cart.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to clear cart.");
    } finally {
      setClearingCart(false);
    }
  };

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();

    if (!normalizedCode) {
      toast.error("Please enter a coupon code.");
      return;
    }

    if (subtotal <= 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      setCouponLoading(true);

      /*
       * Backend coupon service expects:
       * product
       * category
       * price
       * quantity
       *
       * We send the data available from the populated cart.
       */
      const couponItems = items.map((item) => ({
        product: item.product?._id,
        category: item.product?.category || null,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
      }));

      const response = await validateCoupon({
        code: normalizedCode,
        subtotal,
        items: couponItems,
      });

      if (!response?.success) {
        toast.error(response?.message || "Unable to apply coupon.");
        return;
      }

      const discount = Number(response?.coupon?.discount || 0);

      setAppliedCoupon(response.coupon);
      setCouponDiscount(discount);
      setCouponCode(response.coupon.code);

      toast.success(response.message || "Coupon applied successfully.");
    } catch (err) {
      setAppliedCoupon(null);
      setCouponDiscount(0);

      toast.error(
        err?.response?.data?.message || "Invalid or inactive coupon.",
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");

    toast.success("Coupon removed.");
  };

  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        couponCode: appliedCoupon?.code || null,
      },
    });
  };

  const items = cart?.items || [];

  const subtotal = items.reduce((total, item) => {
    return total + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);

  const totalItems = items.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);

  const discountedSubtotal = Math.max(subtotal - couponDiscount, 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-48 rounded bg-neutral-200" />

            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="h-40 rounded-2xl bg-neutral-200" />
              <div className="h-72 rounded-2xl bg-neutral-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="text-center">
          <ShoppingBag
            size={48}
            strokeWidth={1.5}
            className="mx-auto text-neutral-300"
          />

          <h1 className="mt-5 text-2xl font-bold text-neutral-950">
            Unable to Load Cart
          </h1>

          <p className="mt-2 text-neutral-500">{error}</p>

          <button
            type="button"
            onClick={fetchCart}
            className="mt-6 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
            <ShoppingBag
              size={34}
              strokeWidth={1.5}
              className="text-neutral-400"
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-neutral-950">
            Your Cart is Empty
          </h1>

          <p className="mt-2 text-neutral-500">
            Looks like you haven't added anything to your cart yet.
          </p>

          <Link
            to="/"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            Continue Shopping
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
              Shopping Bag
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              Your Cart
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCart}
            disabled={clearingCart}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {clearingCart ? "Clearing..." : "Clear Cart"}
          </button>
        </div>

        {/* Main */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.product;

              if (!product) return null;

              const imageUrl = product.images?.[0]?.url;
              const itemPrice = Number(item.price || 0);
              const itemTotal = itemPrice * Number(item.quantity || 0);

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link
                      to={`/product/${product.slug}`}
                      className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-36 sm:w-36"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.images?.[0]?.alt || product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag size={30} className="text-neutral-300" />
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                            {product.brand || "CBNK"}
                          </p>

                          <Link
                            to={`/product/${product.slug}`}
                            className="mt-1 block text-base font-bold text-neutral-950 hover:underline sm:text-lg"
                          >
                            {product.name}
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item._id)}
                          disabled={updatingItem === item._id}
                          className="shrink-0 text-neutral-400 transition hover:text-red-600 disabled:opacity-40"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Selected options */}
                      {(item.size || item.color) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.size && (
                            <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                              Size: {item.size}
                            </span>
                          )}

                          {item.color && (
                            <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price + Quantity */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-neutral-400">Price</p>

                          <p className="mt-1 font-bold text-neutral-950">
                            ₹{itemPrice.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center overflow-hidden rounded-xl border border-neutral-200">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={
                                item.quantity <= 1 || updatingItem === item._id
                              }
                              className="p-2.5 text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="min-w-10 text-center text-sm font-bold">
                              {updatingItem === item._id
                                ? "..."
                                : item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={updatingItem === item._id}
                              className="p-2.5 text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-30"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-neutral-400">Total</p>

                            <p className="mt-1 font-bold text-neutral-950">
                              ₹{itemTotal.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-neutral-950">
              Order Summary
            </h2>

            {/* Coupon */}
            <div className="mt-6 border-b border-neutral-200 pb-6">
              <div className="flex items-center gap-2">
                <Tag size={17} className="text-neutral-700" />

                <h3 className="text-sm font-bold text-neutral-950">
                  Have a coupon?
                </h3>
              </div>

              {!appliedCoupon ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="Enter coupon code"
                    className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3.5 py-3 text-sm uppercase outline-none transition placeholder:normal-case focus:border-neutral-950"
                  />

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="rounded-xl bg-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
                        <Check size={16} />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-950">
                          {appliedCoupon.code}
                        </p>

                        {appliedCoupon.description && (
                          <p className="mt-1 text-xs text-neutral-500">
                            {appliedCoupon.description}
                          </p>
                        )}

                        <p className="mt-1 text-xs font-semibold text-green-600">
                          You saved ₹{couponDiscount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-neutral-400 transition hover:text-red-600"
                      aria-label="Remove coupon"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>

                <span className="font-semibold text-neutral-950">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Coupon Discount</span>

                  <span className="font-semibold text-green-600">
                    -₹
                    {couponDiscount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>

                <span className="font-semibold text-neutral-500">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-neutral-200" />

            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-950">
                Estimated Total
              </span>

              <span className="text-xl font-bold text-neutral-950">
                ₹{discountedSubtotal.toLocaleString("en-IN")}
              </span>
            </div>

            {couponDiscount > 0 && (
              <p className="mt-2 text-right text-xs text-green-600">
                Coupon applied. Shipping will be calculated at checkout.
              </p>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-neutral-800"
            >
              Proceed to Checkout
              <ArrowRight size={17} />
            </button>

            <Link
              to="/"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-neutral-200 px-5 py-3.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;
