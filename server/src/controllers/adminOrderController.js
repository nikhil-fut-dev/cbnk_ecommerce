import mongoose from "mongoose";

import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

import { refundPayment } from "../services/refundPayment.js";
import { restoreStock } from "../services/inventoryService.js";

/**
 * Allowed admin order status transitions
 */
const STATUS_FLOW = {
  PENDING: ["CONFIRMED"],
  CONFIRMED: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  RETURN_REQUESTED: [],
  RETURNED: [],
  REFUND_INITIATED: [],
  REFUNDED: [],
};

/**
 * Get all orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
      100,
    );

    const skip = (page - 1) * limit;

    const { status, paymentStatus, paymentMethod, search, startDate, endDate } =
      req.query;

    const filter = {};

    if (status) {
      filter.orderStatus = status.toUpperCase();
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus.toUpperCase();
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod.toUpperCase();
    }

    /*
     * Search by order number.
     */
    if (search?.trim()) {
      filter.orderNumber = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    /*
     * Date filtering.
     */
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        const start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date",
          });
        }

        start.setHours(0, 0, 0, 0);

        filter.createdAt.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date",
          });
        }

        end.setHours(23, 59, 59, 999);

        filter.createdAt.$lte = end;
      }
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .populate("user", "fullName username email phone avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      success: true,

      data: {
        orders,

        pagination: {
          page,
          limit,
          totalOrders,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/**
 * Get single order by ID
 */
export const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id)
      .populate("user", "fullName username email phone avatar")
      .populate("items.product", "name slug SKU images")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Get admin order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const newStatus = status.toUpperCase();

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED",
      "REFUND_INITIATED",
      "REFUNDED",
    ];

    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const currentStatus = order.orderStatus;

    if (currentStatus === newStatus) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${newStatus}`,
      });
    }

    const allowedNextStatuses = STATUS_FLOW[currentStatus] || [];

    if (!allowedNextStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot move from ${currentStatus} to ${newStatus}`,
      });
    }

    order.orderStatus = newStatus;

    if (newStatus === "DELIVERED") {
      order.deliveredAt = new Date();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

/**
 * Admin cancel order
 */
export const cancelAdminOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { reason = "Order cancelled by admin" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    let cancelledOrder;

    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);

      if (!order) {
        throw new Error("Order not found");
      }

      const cancellableStatuses = ["PENDING", "CONFIRMED", "PROCESSING"];

      if (!cancellableStatuses.includes(order.orderStatus)) {
        throw new Error("This order cannot be cancelled at this stage");
      }

      /*
       * Razorpay paid order:
       * refund before cancellation.
       */
      if (
        order.paymentMethod === "RAZORPAY" &&
        order.paymentStatus === "PAID"
      ) {
        await refundPayment({
          orderId: order._id,
          userId: order.user,
          reason,
          session,
        });
      }

      /*
       * Stock was deducted only after successful payment.
       */
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
        cancelledBy: "ADMIN",
      };

      cancelledOrder = await order.save({
        session,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order: cancelledOrder,
      },
    });
  } catch (error) {
    console.error("Admin cancel order error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel order",
    });
  } finally {
    await session.endSession();
  }
};
