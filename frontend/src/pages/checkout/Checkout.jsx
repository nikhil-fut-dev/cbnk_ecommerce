import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getAddresses } from "../../services/api/addressApi";
import { getCart } from "../../services/api/cartApi";
import { createOrder } from "../../services/api/orderApi";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../services/api/paymentApi";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  /*
   * Coupon code comes from Cart page.
   */
  const couponCode = location.state?.couponCode || null;

  const cartItems = cart?.items || [];

  /*
   * Frontend subtotal is for display only.
   *
   * Backend calculates the authoritative
   * subtotal and final total.
   */
  const displaySubtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);
  }, [cartItems]);

  /*
   * Load cart + addresses.
   */
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        setError("");

        const [cartResponse, addressResponse] = await Promise.all([
          getCart(),
          getAddresses(),
        ]);

        console.log("CHECKOUT CART RESPONSE:", cartResponse);
        console.log("CHECKOUT ADDRESS RESPONSE:", addressResponse);

        if (!cartResponse?.success) {
          throw new Error(cartResponse?.message || "Failed to load cart");
        }

        if (!addressResponse?.success) {
          throw new Error(
            addressResponse?.message || "Failed to load addresses",
          );
        }

        const loadedCart = cartResponse.cart;
        const loadedAddresses =
          addressResponse?.data || addressResponse?.addresses || [];

        /*
         * Checkout requires at least one cart item.
         */
        if (!loadedCart?.items?.length) {
          toast.error("Your cart is empty");
          navigate("/cart", { replace: true });
          return;
        }

        setCart(loadedCart);
        setAddresses(loadedAddresses);

        /*
         * Select default address automatically.
         */
        const defaultAddress = loadedAddresses.find(
          (address) => address.isDefault,
        );

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (loadedAddresses.length > 0) {
          setSelectedAddressId(loadedAddresses[0]._id);
        }
      } catch (err) {
        console.error("Checkout loading error:", err);

        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load checkout";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [navigate]);

  /*
   * Create order.
   */
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      setPlacingOrder(true);

      /*
       * STEP 1
       * Create CBNK order in our backend.
       *
       * Backend calculates:
       * - subtotal
       * - coupon discount
       * - shipping
       * - tax
       * - final total
       */
      const response = await createOrder({
        addressId: selectedAddressId,
        paymentMethod,
        couponCode,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to create order");
      }

      const createdOrder = response?.data?.order;

      if (!createdOrder?._id) {
        throw new Error("Order was created but order ID is missing");
      }

      /*
       * COD FLOW
       */
      if (paymentMethod === "COD") {
        toast.success("Order placed successfully");

        navigate(`/account/orders/${createdOrder._id}`, {
          replace: true,
        });

        return;
      }

      /*
       * RAZORPAY FLOW
       *
       * First ask backend to create Razorpay order.
       */
      const razorpayResponse = await createRazorpayOrder(createdOrder._id);

      if (!razorpayResponse?.success) {
        throw new Error(
          razorpayResponse?.message || "Failed to create Razorpay order",
        );
      }

      const paymentData = razorpayResponse?.data;

      if (
        !paymentData?.razorpayOrderId ||
        !paymentData?.paymentId ||
        !paymentData?.amount ||
        !paymentData?.keyId
      ) {
        throw new Error("Invalid Razorpay payment data received");
      }

      /*
       * Razorpay Checkout options.
       */
      const options = {
        key: paymentData.keyId,

        amount: paymentData.amount,

        currency: paymentData.currency || "INR",

        name: "CBNK",

        description: `Payment for order ${paymentData.orderNumber}`,

        order_id: paymentData.razorpayOrderId,

        handler: async function (paymentResponse) {
          try {
            toast.loading("Verifying payment...", {
              id: "payment-verification",
            });

            /*
             * Verify Razorpay payment on our backend.
             *
             * IMPORTANT:
             * Frontend never decides whether payment
             * is successful.
             *
             * Backend verifies Razorpay signature
             * and payment details.
             */
            const verificationResponse = await verifyRazorpayPayment({
              orderId: createdOrder._id,

              razorpayOrderId: paymentResponse.razorpay_order_id,

              razorpayPaymentId: paymentResponse.razorpay_payment_id,

              razorpaySignature: paymentResponse.razorpay_signature,
            });

            toast.dismiss("payment-verification");

            if (!verificationResponse?.success) {
              throw new Error(
                verificationResponse?.message || "Payment verification failed",
              );
            }

            toast.success("Payment successful");

            /*
             * Payment verified successfully.
             * Now go to order details.
             */
            navigate(`/account/orders/${createdOrder._id}`, {
              replace: true,
            });
          } catch (verificationError) {
            console.error(
              "Razorpay payment verification error:",
              verificationError,
            );

            toast.dismiss("payment-verification");

            const message =
              verificationError.response?.data?.message ||
              verificationError.message ||
              "Payment verification failed";

            toast.error(message);

            /*
             * Payment may still exist on Razorpay side.
             * Keep the user on checkout/payment flow
             * instead of falsely showing success.
             */
          }
        },

        prefill: {
          name: createdOrder?.shippingAddress?.fullName || "",
          email: "",
          contact: createdOrder?.shippingAddress?.phone || "",
        },

        notes: {
          orderId: createdOrder._id,
          orderNumber: createdOrder.orderNumber,
        },

        theme: {
          color: "#111111",
        },

        modal: {
          ondismiss: function () {
            toast("Payment window closed", {
              icon: "ℹ️",
            });
          },
        },
      };

      /*
       * Razorpay Checkout must be loaded
       * from frontend/index.html.
       */
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout is not loaded. Please check frontend/index.html",
        );
      }

      const razorpay = new window.Razorpay(options);

      /*
       * Razorpay can also report payment failures.
       */
      razorpay.on("payment.failed", function (failureResponse) {
        console.error("Razorpay payment failed:", failureResponse);

        const description =
          failureResponse?.error?.description ||
          "Payment failed. Please try again.";

        toast.error(description);
      });

      razorpay.open();
    } catch (err) {
      console.error("Place order / payment error:", err);

      const message =
        err.response?.data?.message || err.message || "Failed to process order";

      toast.error(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="mb-8 h-8 w-48 rounded bg-neutral-200" />

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="h-96 rounded-2xl bg-neutral-200" />
              <div className="h-96 rounded-2xl bg-neutral-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-neutral-900">
            Unable to load checkout
          </h1>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            CBNK Checkout
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            Complete your order
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Confirm your delivery address and payment method.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Address */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-950">
                    Delivery Address
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Select where you want your order delivered.
                  </p>
                </div>

                <Link
                  to="/account/addresses"
                  className="shrink-0 text-sm font-medium text-neutral-900 underline underline-offset-4"
                >
                  Manage
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-neutral-300 p-6 text-center">
                  <h3 className="font-medium text-neutral-900">
                    No delivery address
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    Add an address before placing your order.
                  </p>

                  <Link
                    to="/account/addresses"
                    className="mt-4 inline-flex rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white"
                  >
                    Add Address
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {addresses.map((address) => {
                    const selected = selectedAddressId === address._id;

                    return (
                      <button
                        key={address._id}
                        type="button"
                        onClick={() => setSelectedAddressId(address._id)}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950"
                            : "border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-neutral-950"
                                : "border-neutral-400"
                            }`}
                          >
                            {selected && (
                              <span className="h-2 w-2 rounded-full bg-neutral-950" />
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-neutral-900">
                                {address.fullName}
                              </span>

                              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                                {address.addressType}
                              </span>

                              {address.isDefault && (
                                <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-sm leading-6 text-neutral-600">
                              {address.addressLine1}
                              {address.addressLine2 &&
                                `, ${address.addressLine2}`}
                              {address.landmark && `, ${address.landmark}`}
                              {`, ${address.city}, ${address.state} - ${address.postalCode}`}
                            </p>

                            <p className="mt-2 text-sm text-neutral-600">
                              Phone: {address.phone}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-neutral-950">
                Payment Method
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Choose how you want to pay.
              </p>

              <div className="mt-6 space-y-3">
                {/* Razorpay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    paymentMethod === "RAZORPAY"
                      ? "border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        paymentMethod === "RAZORPAY"
                          ? "border-neutral-950"
                          : "border-neutral-400"
                      }`}
                    >
                      {paymentMethod === "RAZORPAY" && (
                        <span className="h-2.5 w-2.5 rounded-full bg-neutral-950" />
                      )}
                    </span>

                    <div>
                      <p className="font-semibold text-neutral-900">Razorpay</p>

                      <p className="mt-1 text-sm text-neutral-500">
                        UPI, Cards, Net Banking and more
                      </p>
                    </div>
                  </div>
                </button>

                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    paymentMethod === "COD"
                      ? "border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        paymentMethod === "COD"
                          ? "border-neutral-950"
                          : "border-neutral-400"
                      }`}
                    >
                      {paymentMethod === "COD" && (
                        <span className="h-2.5 w-2.5 rounded-full bg-neutral-950" />
                      )}
                    </span>

                    <div>
                      <p className="font-semibold text-neutral-900">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        Pay when your order is delivered
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            {/* Items */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-neutral-950">
                Order Items
              </h2>

              <div className="mt-6 divide-y divide-neutral-100">
                {cartItems.map((item) => {
                  const product = item.product;

                  const itemTotal =
                    Number(item.price || 0) * Number(item.quantity || 0);

                  const image = product?.images?.[0]?.url || "";

                  return (
                    <div
                      key={item._id}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        {image ? (
                          <img
                            src={image}
                            alt={product?.name || "Product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-neutral-900">
                          {product?.name || "Product"}
                        </h3>

                        {(item.size || item.color) && (
                          <p className="mt-1 text-xs text-neutral-500">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && " • "}
                            {item.color && `Color: ${item.color}`}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-neutral-500">
                          ₹{Number(item.price || 0).toFixed(2)} ×{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 font-semibold text-neutral-900">
                        ₹{itemTotal.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* SUMMARY */}
          <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-lg font-semibold text-neutral-950">
              Order Summary
            </h2>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Subtotal</span>

                <span className="font-medium text-neutral-900">
                  ₹{displaySubtotal.toFixed(2)}
                </span>
              </div>

              {couponCode && (
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Coupon</span>

                  <span className="font-medium text-green-600">
                    {couponCode}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Shipping</span>

                <span className="text-neutral-500">Calculated by server</span>
              </div>
            </div>

            <div className="my-5 border-t border-neutral-200" />

            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-neutral-950">Total</span>

              <span className="text-xl font-bold text-neutral-950">
                ₹{displaySubtotal.toFixed(2)}
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-neutral-500">
              The final amount is calculated and validated securely by the
              backend when your order is created.
            </p>

            <button
              type="button"
              disabled={
                !selectedAddressId || addresses.length === 0 || placingOrder
              }
              onClick={handlePlaceOrder}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {placingOrder
                ? "Creating Order..."
                : paymentMethod === "COD"
                  ? "Place Order"
                  : "Continue to Payment"}
            </button>

            <Link
              to="/cart"
              className="mt-3 block text-center text-sm font-medium text-neutral-600 hover:text-neutral-950"
            >
              ← Back to Cart
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
