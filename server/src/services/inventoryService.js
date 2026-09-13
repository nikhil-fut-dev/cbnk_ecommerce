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

  const variants = product.variants.map((variant) => ({
    variant: variant._id,
    SKU: variant.SKU,
    size: variant.size || "",
    color: variant.color || "",
    stock: variant.stock || 0,
    reservedStock: 0,
    soldStock: 0,
    lowStockThreshold: 5,
  }));

  const totalVariantStock = variants.reduce(
    (total, variant) => total + variant.stock,
    0,
  );

  if (!inventory) {
    inventory = await Inventory.create({
      product: product._id,
      totalStock: variants.length > 0 ? totalVariantStock : product.stock || 0,
      reservedStock: 0,
      soldStock: 0,
      lowStockThreshold: 5,
      variants,
      lastRestockedAt: new Date(),
    });
  } else {
    inventory.totalStock =
      variants.length > 0 ? totalVariantStock : product.stock || 0;

    inventory.variants = variants;

    await inventory.save();
  }

  return inventory;
};

/**
 * Check available stock
 */
export const checkStock = async ({ productId, variantId = null, quantity }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  if (!quantity || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const inventory = await Inventory.findOne({
    product: productId,
  });

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  if (variantId) {
    const variant = inventory.variants.find(
      (item) => item.variant?.toString() === variantId.toString(),
    );

    if (!variant) {
      throw new Error("Inventory variant not found");
    }

    const availableStock = variant.stock - variant.reservedStock;

    return {
      available: availableStock >= quantity,
      availableStock,
    };
  }

  const availableStock = inventory.totalStock - inventory.reservedStock;

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

  if (!quantity || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

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
            $expr: {
              $gte: [
                {
                  $subtract: ["$$this.stock", "$$this.reservedStock"],
                },
                quantity,
              ],
            },
          },
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

  if (!quantity || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  if (variantId) {
    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      throw new Error("Invalid variant ID");
    }

    const result = await Inventory.findOneAndUpdate(
      {
        product: productId,
        "variants.variant": variantId,
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
      throw new Error("Inventory variant not found");
    }

    return result;
  }

  const result = await Inventory.findOneAndUpdate(
    {
      product: productId,
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
    throw new Error("Inventory not found");
  }

  return result;
};
