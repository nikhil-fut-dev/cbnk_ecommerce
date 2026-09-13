import mongoose from "mongoose";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import Product from "../models/Product.js";

import { generateOrderNumber } from "../utils/generateOrderNumber.js";
import { calculateOrderPricing } from "../services/calculatePricing.js";
import { refundPayment } from "../services/refundPayment.js";
import { checkStock, restoreStock } from "../services/inventoryService.js";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      addressId,
      paymentMethod = "RAZORPAY",
      couponCode = null,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Basic Validation
    |--------------------------------------------------------------------------
    */

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    if (!["RAZORPAY", "COD"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Address Ownership
    |--------------------------------------------------------------------------
    */

    const address = await Address.findOne({
      _id: addressId,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Shipping address not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get Customer Cart
    |--------------------------------------------------------------------------
    */

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Re-validate Cart
    |
    | Never trust price/stock coming from the client.
    | Everything is fetched again from the database.
    |--------------------------------------------------------------------------
    */

    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = await Product.findOne({
        _id: cartItem.product,
        isActive: true,
        isDeleted: false,
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${cartItem.product} is no longer available`,
        });
      }

      let selectedPrice = product.price;
      let selectedSKU = product.SKU;
      let selectedImage = product.images?.[0]?.url || "";

      /*
|--------------------------------------------------------------------------
| Variant Validation
|--------------------------------------------------------------------------
*/

      if (cartItem.variant) {
        const variant = product.variants.id(cartItem.variant);

        if (!variant || !variant.isActive) {
          return res.status(400).json({
            success: false,
            message: `${product.name} selected variant is no longer available`,
          });
        }

        selectedPrice = variant.price !== null ? variant.price : product.price;

        selectedSKU = variant.SKU;

        selectedImage = variant.image?.url || product.images?.[0]?.url || "";
      }

      /*
      |--------------------------------------------------------------------------
      | Inventory Validation
      |--------------------------------------------------------------------------
      |
      | Product.stock is NOT trusted for checkout.
      | Inventory is the source of truth.
      |--------------------------------------------------------------------------
      */

      const stockCheck = await checkStock({
        productId: product._id,
        variantId: cartItem.variant || null,
        quantity: cartItem.quantity,
      });

      if (!stockCheck.available) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
          data: {
            availableStock: stockCheck.availableStock,
            requestedQuantity: cartItem.quantity,
          },
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Order Item Snapshot
      |--------------------------------------------------------------------------
      */

      const itemTotal = selectedPrice * cartItem.quantity;

      orderItems.push({
        product: product._id,
        variant: cartItem.variant || null,

        name: product.name,
        slug: product.slug,

        SKU: selectedSKU,
        image: selectedImage,

        size: cartItem.size || "",
        color: cartItem.color || "",

        quantity: cartItem.quantity,

        // Important:
        // Price is taken from database, never from client.
        price: selectedPrice,
        total: itemTotal,

        // Required for category-based coupons.
        category: product.category,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate Final Checkout Pricing
    |--------------------------------------------------------------------------
    */

    const pricing = await calculateOrderPricing({
      items: orderItems,
      userId: req.user._id,
      couponCode,
    });

    const { subtotal, discount, shippingFee, tax, total, coupon } = pricing;

    /*
    |--------------------------------------------------------------------------
    | Shipping Address Snapshot
    |
    | Address may change later, so order stores its own copy.
    |--------------------------------------------------------------------------
    */

    const shippingAddress = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };

    /*
    |--------------------------------------------------------------------------
    | Start Transaction
    |--------------------------------------------------------------------------
    */

    session.startTransaction();

    /*
    |--------------------------------------------------------------------------
    | Create Order
    |--------------------------------------------------------------------------
    */

    const [order] = await Order.create(
      [
        {
          orderNumber: generateOrderNumber(),

          user: req.user._id,

          items: orderItems,

          shippingAddress,

          subtotal,
          discount,
          shippingFee,
          tax,
          total,

          coupon: coupon
            ? {
                code: coupon.code,
                discount: discount,
              }
            : null,

          paymentMethod,

          paymentStatus: "PENDING",

          orderStatus: "PENDING",
        },
      ],
      { session },
    );

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await session.commitTransaction();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message: "Order created successfully",

      data: {
        order,
        pricing: {
          subtotal,
          discount,
          shippingFee,
          tax,
          total,
        },

        coupon: coupon
          ? {
              code: coupon.code,
              discount,
            }
          : null,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Create order error:", error.message);

    /*
    |--------------------------------------------------------------------------
    | Coupon / Validation Errors
    |--------------------------------------------------------------------------
    */

    const clientErrors = [
      "Invalid or inactive coupon",
      "Coupon is not active yet",
      "Coupon has expired",
      "Coupon usage limit reached",
      "Minimum order value",
      "Maximum order value",
      "You have already reached",
      "Coupon is not applicable",
      "Cart is empty",
    ];

    const isClientError = clientErrors.some((message) =>
      error.message.includes(message),
    );

    if (isClientError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  } finally {
    await session.endSession();
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
      50,
    );

    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find({
        user: req.user._id,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments({
        user: req.user._id,
      }),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { reason = "Order cancelled by customer" } = req.body;

    let cancelledOrder;

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: id,
        user: req.user._id,
      }).session(session);

      if (!order) {
        throw new Error("Order not found");
      }

      const cancellableStatuses = ["PENDING", "CONFIRMED", "PROCESSING"];

      if (!cancellableStatuses.includes(order.orderStatus)) {
        throw new Error("This order cannot be cancelled at this stage");
      }

      if (order.orderStatus === "CANCELLED") {
        throw new Error("Order is already cancelled");
      }

      // Paid Razorpay order → refund first
      if (
        order.paymentMethod === "RAZORPAY" &&
        order.paymentStatus === "PAID"
      ) {
        await refundPayment({
          orderId: order._id,
          userId: req.user._id,
          reason,
          session,
        });
      }

      // Restore inventory only when stock had actually been deducted
      if (order.paymentStatus === "PAID") {
        for (const item of order.items) {
          await restoreStock({
            productId: item.product,
            variantId: item.variant || null,
            quantity: item.quantity,
            session,
          });
        }
      }

      order.orderStatus = "CANCELLED";
      order.cancellation = {
        reason,
        cancelledAt: new Date(),
        cancelledBy: "CUSTOMER",
      };

      cancelledOrder = await order.save({ session });
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order: cancelledOrder,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel order",
    });
  } finally {
    await session.endSession();
  }
};
