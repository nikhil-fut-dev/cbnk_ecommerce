import mongoose from "mongoose";

import Inventory from "../models/Inventory.js";

import {
  getInventoryByProduct,
  createOrSyncInventory,
} from "../services/inventoryService.js";

/* =========================================================
   GET PRODUCT INVENTORY
========================================================= */

export const getProductInventory = async (req, res) => {
  try {
    const inventory = await getInventoryByProduct(req.params.productId);

    return res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   SYNC PRODUCT INVENTORY
========================================================= */

export const syncProductInventory = async (req, res) => {
  try {
    const inventory = await createOrSyncInventory(req.params.productId);

    return res.status(200).json({
      success: true,
      message: "Inventory synchronized successfully",
      data: inventory,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   GET ALL INVENTORY - ADMIN
========================================================= */

export const getAllInventory = async (req, res) => {
  try {
    const { search, lowStock, page = 1, limit = 20 } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * currentLimit;

    /*
     * Populate product first so admin can see
     * product information with inventory.
     */

    let inventories = await Inventory.find({})
      .populate("product", "name slug SKU price images isActive isDeleted")
      .sort({ updatedAt: -1 })
      .lean();

    /* =====================================================
       SEARCH
    ===================================================== */

    if (search?.trim()) {
      const searchText = search.trim().toLowerCase();

      inventories = inventories.filter((inventory) => {
        const product = inventory.product;

        if (!product) {
          return false;
        }

        return (
          product.name?.toLowerCase().includes(searchText) ||
          product.SKU?.toLowerCase().includes(searchText) ||
          product.slug?.toLowerCase().includes(searchText)
        );
      });
    }

    /* =====================================================
       LOW STOCK FILTER
    ===================================================== */

    if (lowStock === "true") {
      inventories = inventories.filter((inventory) => {
        const productAvailableStock =
          Number(inventory.totalStock || 0) -
          Number(inventory.reservedStock || 0);

        const productIsLowStock =
          productAvailableStock <= Number(inventory.lowStockThreshold || 0);

        const variantIsLowStock = (inventory.variants || []).some((variant) => {
          const availableStock =
            Number(variant.stock || 0) - Number(variant.reservedStock || 0);

          return availableStock <= Number(variant.lowStockThreshold || 0);
        });

        return productIsLowStock || variantIsLowStock;
      });
    }

    const total = inventories.length;

    const paginatedInventories = inventories.slice(skip, skip + currentLimit);

    return res.status(200).json({
      success: true,
      data: paginatedInventories,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
        hasNext: currentPage < Math.ceil(total / currentLimit),
        hasPrev: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get all inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

/* =========================================================
   GET LOW STOCK PRODUCTS
========================================================= */

export const getLowStockProducts = async (req, res) => {
  try {
    const inventories = await Inventory.find({})
      .populate("product", "name slug SKU price images isActive isDeleted")
      .sort({ updatedAt: -1 })
      .lean();

    const lowStockInventories = inventories.filter((inventory) => {
      const availableStock =
        Number(inventory.totalStock || 0) -
        Number(inventory.reservedStock || 0);

      const productIsLowStock =
        availableStock <= Number(inventory.lowStockThreshold || 0);

      const variantIsLowStock = (inventory.variants || []).some((variant) => {
        const variantAvailableStock =
          Number(variant.stock || 0) - Number(variant.reservedStock || 0);

        return variantAvailableStock <= Number(variant.lowStockThreshold || 0);
      });

      return productIsLowStock || variantIsLowStock;
    });

    return res.status(200).json({
      success: true,
      count: lowStockInventories.length,
      data: lowStockInventories,
    });
  } catch (error) {
    console.error("Get low-stock inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch low-stock products",
    });
  }
};

/* =========================================================
   RESTOCK PRODUCT
========================================================= */

export const restockProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const { quantity, variantId = null, lowStockThreshold } = req.body;

    /* -----------------------------------------------------
       Validate IDs
    ----------------------------------------------------- */

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (variantId && !mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    /* -----------------------------------------------------
       Validate quantity
    ----------------------------------------------------- */

    const restockQuantity = Number(quantity);

    if (!Number.isInteger(restockQuantity) || restockQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Restock quantity must be at least 1",
      });
    }

    /* -----------------------------------------------------
       Get inventory
    ----------------------------------------------------- */

    const inventory = await Inventory.findOne({
      product: productId,
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    /* =====================================================
       VARIANT RESTOCK
    ===================================================== */

    if (variantId) {
      const variant = inventory.variants.find(
        (item) => item.variant?.toString() === variantId.toString(),
      );

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Inventory variant not found",
        });
      }

      variant.stock += restockQuantity;

      if (lowStockThreshold !== undefined) {
        const threshold = Number(lowStockThreshold);

        if (!Number.isInteger(threshold) || threshold < 0) {
          return res.status(400).json({
            success: false,
            message: "Low-stock threshold must be a valid non-negative number",
          });
        }

        variant.lowStockThreshold = threshold;
      }

      /*
       * Recalculate totals from variants.
       */

      inventory.totalStock = inventory.variants.reduce(
        (total, item) => total + Number(item.stock || 0),
        0,
      );

      inventory.reservedStock = inventory.variants.reduce(
        (total, item) => total + Number(item.reservedStock || 0),
        0,
      );

      inventory.soldStock = inventory.variants.reduce(
        (total, item) => total + Number(item.soldStock || 0),
        0,
      );

      inventory.lastRestockedAt = new Date();

      await inventory.save();

      return res.status(200).json({
        success: true,
        message: "Variant inventory restocked successfully",
        data: inventory,
      });
    }

    /* =====================================================
       SIMPLE PRODUCT RESTOCK
    ===================================================== */

    /*
     * Do not use Product.stock here.
     *
     * Inventory is the source of truth.
     */

    inventory.totalStock += restockQuantity;

    if (lowStockThreshold !== undefined) {
      const threshold = Number(lowStockThreshold);

      if (!Number.isInteger(threshold) || threshold < 0) {
        return res.status(400).json({
          success: false,
          message: "Low-stock threshold must be a valid non-negative number",
        });
      }

      inventory.lowStockThreshold = threshold;
    }

    inventory.lastRestockedAt = new Date();

    await inventory.save();

    return res.status(200).json({
      success: true,
      message: "Product inventory restocked successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Restock inventory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to restock inventory",
    });
  }
};
