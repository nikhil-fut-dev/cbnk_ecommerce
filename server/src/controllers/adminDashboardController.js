import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Inventory from "../models/Inventory.js";

export const getAdminDashboard = async (req, res) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Basic Counts
    |--------------------------------------------------------------------------
    */

    const [
      totalCustomers,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      User.countDocuments({
        role: "CUSTOMER",
      }),

      Product.countDocuments({
        isDeleted: false,
      }),

      Product.countDocuments({
        isActive: true,
        isDeleted: false,
      }),

      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: "PENDING",
      }),

      Order.countDocuments({
        orderStatus: "CONFIRMED",
      }),

      Order.countDocuments({
        orderStatus: "PROCESSING",
      }),

      Order.countDocuments({
        orderStatus: "SHIPPED",
      }),

      Order.countDocuments({
        orderStatus: "DELIVERED",
      }),

      Order.countDocuments({
        orderStatus: "CANCELLED",
      }),
    ]);

    /*
    |--------------------------------------------------------------------------
    | Revenue
    |--------------------------------------------------------------------------
    |
    | Only PAID orders are counted as revenue.
    |--------------------------------------------------------------------------
    */

    const revenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$total",
          },
          totalOrders: {
            $sum: 1,
          },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const paidOrders = revenueResult[0]?.totalOrders || 0;

    /*
    |--------------------------------------------------------------------------
    | Order Status Summary
    |--------------------------------------------------------------------------
    */

    const orderStatusSummary = {
      pending: pendingOrders,
      confirmed: confirmedOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    };

    /*
    |--------------------------------------------------------------------------
    | Low Stock Products
    |--------------------------------------------------------------------------
    */

    const inventories = await Inventory.find({
      "variants.0": {
        $exists: true,
      },
    })
      .populate("product", "name slug SKU images isActive isDeleted")
      .lean();

    const lowStockProducts = [];

    for (const inventory of inventories) {
      if (!inventory.product || inventory.product.isDeleted) {
        continue;
      }

      const lowVariants = (inventory.variants || []).filter((variant) => {
        const availableStock = Math.max(
          variant.stock - variant.reservedStock,
          0,
        );

        return availableStock <= variant.lowStockThreshold;
      });

      if (lowVariants.length > 0) {
        lowStockProducts.push({
          product: inventory.product,
          variants: lowVariants,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Simple Products Without Variants
    |--------------------------------------------------------------------------
    */

    const simpleInventories = await Inventory.find({
      "variants.0": {
        $exists: false,
      },
    })
      .populate("product", "name slug SKU images isActive isDeleted")
      .lean();

    for (const inventory of simpleInventories) {
      if (!inventory.product || inventory.product.isDeleted) {
        continue;
      }

      const availableStock = Math.max(
        inventory.totalStock - inventory.reservedStock,
        0,
      );

      if (availableStock <= inventory.lowStockThreshold) {
        lowStockProducts.push({
          product: inventory.product,
          availableStock,
          lowStockThreshold: inventory.lowStockThreshold,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Recent Orders
    |--------------------------------------------------------------------------
    */

    const recentOrders = await Order.find()
      .populate("user", "fullName username email")
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Recent Customers
    |--------------------------------------------------------------------------
    */

    const recentCustomers = await User.find({
      role: "CUSTOMER",
    })
      .select("fullName username email avatar createdAt lastLogin")
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      data: {
        overview: {
          totalCustomers,
          totalProducts,
          activeProducts,
          totalOrders,

          paidOrders,

          totalRevenue,
        },

        orders: {
          total: totalOrders,
          ...orderStatusSummary,
        },

        lowStock: {
          count: lowStockProducts.length,
          products: lowStockProducts.slice(0, 10),
        },

        recentOrders,

        recentCustomers,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard",
    });
  }
};
