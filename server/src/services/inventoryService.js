import mongoose from "mongoose";

import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";

/**
 * Get inventory for a product
 */
export const getInventoryByProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const inventory = await Inventory.findOne({
    product: productId,
  }).populate("product", "name slug SKU price stock variants images");

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  return inventory;
};

/**
 * Create or synchronize inventory from product
 *
 * Important:
 * Existing stock/sold/reserved values are preserved.
 * Product updates must never reset soldStock.
 */
export const createOrSyncInventory = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  let inventory = await Inventory.findOne({
    product: product._id,
  });

  /*
   * Create inventory for the first time.
   */
  if (!inventory) {
    const variants = product.variants.map((variant) => ({
      variant: variant._id,
      SKU: variant.SKU,
      size: variant.size || "",
      color: variant.color || "",
      stock: Number(variant.stock || 0),
      reservedStock: 0,
      soldStock: 0,
      lowStockThreshold: 5,
    }));

    const totalVariantStock = variants.reduce(
      (total, variant) => total + variant.stock,
      0,
    );

    inventory = await Inventory.create({
      product: product._id,
      totalStock:
        variants.length > 0 ? totalVariantStock : Number(product.stock || 0),
      reservedStock: 0,
      soldStock: 0,
      lowStockThreshold: 5,
      variants,
      lastRestockedAt: new Date(),
    });

    return inventory;
  }

  /*
   * Existing inventory:
   * Preserve current stock/sold/reserved values.
   *
   * New product variants are added.
   * Removed product variants are removed from inventory.
   * Existing variant stock is NOT overwritten.
   */
  const existingVariants = inventory.variants || [];

  const existingVariantMap = new Map(
    existingVariants.map((item) => [item.variant?.toString(), item]),
  );

  const syncedVariants = product.variants.map((productVariant) => {
    const variantId = productVariant._id.toString();

    const existingVariant = existingVariantMap.get(variantId);

    if (existingVariant) {
      existingVariant.SKU = productVariant.SKU;
      existingVariant.size = productVariant.size || "";
      existingVariant.color = productVariant.color || "";

      return existingVariant;
    }

    /*
     * New variant.
     */
    return {
      variant: productVariant._id,
      SKU: productVariant.SKU,
      size: productVariant.size || "",
      color: productVariant.color || "",
      stock: Number(productVariant.stock || 0),
      reservedStock: 0,
      soldStock: 0,
      lowStockThreshold: 5,
    };
  });

  inventory.variants = syncedVariants;

  /*
   * For variant products, totalStock should be calculated
   * from inventory variants.
   */
  if (syncedVariants.length > 0) {
    inventory.totalStock = syncedVariants.reduce(
      (total, variant) => total + Number(variant.stock || 0),
      0,
    );

    inventory.reservedStock = syncedVariants.reduce(
      (total, variant) => total + Number(variant.reservedStock || 0),
      0,
    );

    inventory.soldStock = syncedVariants.reduce(
      (total, variant) => total + Number(variant.soldStock || 0),
      0,
    );
  }

  await inventory.save();

  return inventory;
};

/**
 * Check available stock
 */
export const checkStock = async ({ productId, variantId = null, quantity }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const inventory = await Inventory.findOne({
    product: productId,
  });

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  /*
   * Variant stock
   */
  if (variantId) {
    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      throw new Error("Invalid variant ID");
    }

    const variant = inventory.variants.find(
      (item) => item.variant?.toString() === variantId.toString(),
    );

    if (!variant) {
      throw new Error("Inventory variant not found");
    }

    const availableStock = Math.max(
      0,
      Number(variant.stock || 0) - Number(variant.reservedStock || 0),
    );

    return {
      available: availableStock >= quantity,
      availableStock,
    };
  }

  /*
   * Simple product stock
   */
  const availableStock = Math.max(
    0,
    Number(inventory.totalStock || 0) - Number(inventory.reservedStock || 0),
  );

  return {
    available: availableStock >= quantity,
    availableStock,
  };
};

/**
 * Deduct stock atomically
 */
export const deductStock = async ({
  productId,
  variantId = null,
  quantity,
  session = null,
}) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  /*
   * Variant product
   */
  if (variantId) {
    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      throw new Error("Invalid variant ID");
    }

    /*
     * The $expr checks the matching variant's:
     *
     * stock - reservedStock >= quantity
     *
     * before performing the atomic update.
     */
    const result = await Inventory.findOneAndUpdate(
      {
        product: productId,

        variants: {
          $elemMatch: {
            variant: variantId,
          },
        },

        $expr: {
          $gte: [
            {
              $subtract: [
                {
                  $let: {
                    vars: {
                      matchingVariant: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$variants",
                              as: "item",
                              cond: {
                                $eq: [
                                  "$$item.variant",
                                  new mongoose.Types.ObjectId(variantId),
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: "$$matchingVariant.stock",
                  },
                },
                {
                  $let: {
                    vars: {
                      matchingVariant: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$variants",
                              as: "item",
                              cond: {
                                $eq: [
                                  "$$item.variant",
                                  new mongoose.Types.ObjectId(variantId),
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: "$$matchingVariant.reservedStock",
                  },
                },
              ],
            },
            quantity,
          ],
        },
      },
      {
        $inc: {
          "variants.$.stock": -quantity,
          "variants.$.soldStock": quantity,
          totalStock: -quantity,
          soldStock: quantity,
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!result) {
      throw new Error("Insufficient variant stock");
    }

    return result;
  }

  /*
   * Simple product
   */
  const result = await Inventory.findOneAndUpdate(
    {
      product: productId,

      $expr: {
        $gte: [
          {
            $subtract: ["$totalStock", "$reservedStock"],
          },
          quantity,
        ],
      },
    },
    {
      $inc: {
        totalStock: -quantity,
        soldStock: quantity,
      },
    },
    {
      new: true,
      session,
    },
  );

  if (!result) {
    throw new Error("Insufficient stock");
  }

  return result;
};

/**
 * Restore stock
 */
export const restoreStock = async ({
  productId,
  variantId = null,
  quantity,
  session = null,
}) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  /*
   * Variant product
   */
  if (variantId) {
    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      throw new Error("Invalid variant ID");
    }

    const result = await Inventory.findOneAndUpdate(
      {
        product: productId,
        variants: {
          $elemMatch: {
            variant: variantId,
            soldStock: { $gte: quantity },
          },
        },
      },
      {
        $inc: {
          "variants.$.stock": quantity,
          "variants.$.soldStock": -quantity,
          totalStock: quantity,
          soldStock: -quantity,
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!result) {
      throw new Error(
        "Inventory variant not found or invalid restore quantity",
      );
    }

    return result;
  }

  /*
   * Simple product
   */
  const result = await Inventory.findOneAndUpdate(
    {
      product: productId,
      soldStock: {
        $gte: quantity,
      },
    },
    {
      $inc: {
        totalStock: quantity,
        soldStock: -quantity,
      },
    },
    {
      new: true,
      session,
    },
  );

  if (!result) {
    throw new Error("Inventory not found or invalid restore quantity");
  }

  return result;
};
