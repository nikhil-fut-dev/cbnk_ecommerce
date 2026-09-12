import mongoose from "mongoose";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import Product from "../models/Product.js";

import { generateOrderNumber } from "../utils/generateOrderNumber.js";
import { calculateOrderPricing } from "../utils/calculatePricing.js";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { addressId, paymentMethod = "RAZORPAY" } = req.body;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (!["RAZORPAY", "COD"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

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
     * Re-check every cart item against the current
     * database product before creating the order.
     */
    const orderItems = [];
    let subtotal = 0;

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

      let availableStock = product.stock;
      let selectedPrice = product.price;
      let selectedSKU = product.SKU;
      let selectedImage = product.images?.[0]?.url || "";

      if (cartItem.variant) {
        const variant = product.variants.id(cartItem.variant);

        if (!variant || !variant.isActive) {
          return res.status(400).json({
            success: false,
            message: `${product.name} selected variant is no longer available`,
          });
        }

        availableStock = variant.stock;

        selectedPrice = variant.price !== null ? variant.price : product.price;

        selectedSKU = variant.SKU;

        selectedImage = variant.image?.url || product.images?.[0]?.url || "";
      }

      if (cartItem.quantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemTotal = selectedPrice * cartItem.quantity;

      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        variant: cartItem.variant,
        name: product.name,
        slug: product.slug,
        SKU: selectedSKU,
        image: selectedImage,
        size: cartItem.size,
        color: cartItem.color,
        quantity: cartItem.quantity,
        price: selectedPrice,
        total: itemTotal,
      });
    }

    const pricing = calculateOrderPricing({
      subtotal,
      coupon: null,
    });

    const { discount, shippingFee, tax, total } = pricing;

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

    session.startTransaction();

    /*
     * Create order first.
     *
     * Inventory deduction is intentionally handled
     * in the inventory/payment stage to avoid reducing
     * stock for an unpaid Razorpay order.
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
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
          orderStatus: "PENDING",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  } finally {
    session.endSession();
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
    const order = await Order.findOne({
      _id: req.params.id,
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
  try {
    const { reason = "Customer requested cancellation" } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const cancellableStatuses = ["PENDING", "CONFIRMED", "PROCESSING"];

    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be cancelled",
      });
    }

    order.orderStatus = "CANCELLED";

    order.cancellation = {
      reason: reason.trim(),
      cancelledAt: new Date(),
      cancelledBy: req.user._id,
    };

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};
