import mongoose from "mongoose";

import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const getInventoryByProduct = async (productId) => {
  if (!isValidObjectId(productId)) {
    throw new Error("Invalid product ID");
  }

  const inventory = await Inventory.findOne({
    product: productId,
  }).populate("product", "name slug SKU");

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  return inventory;
};

export const createOrSyncInventory = async (productId) => {
  if (!isValidObjectId(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const variantInventory = product.variants.map((variant) => ({
    variant: variant._id,
    SKU: variant.SKU,
    size: variant.size,
    color: variant.color,
    stock: variant.stock,
    reservedStock: 0,
    soldStock: 0,
    lowStockThreshold: 5,
  }));

  const inventory = await Inventory.findOneAndUpdate(
    { product: product._id },
    {
      $set: {
        totalStock: product.stock,
        variants: variantInventory,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return inventory;
};

export const checkStock = async ({ productId, variantId = null, quantity }) => {
  if (!isValidObjectId(productId)) {
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

  if (variantId) {
    const variant = inventory.variants.id(variantId);

    if (!variant) {
      throw new Error("Inventory variant not found");
    }

    const availableStock = variant.stock - variant.reservedStock;

    if (availableStock < quantity) {
      throw new Error(`Insufficient stock. Available stock: ${availableStock}`);
    }

    return {
      available: true,
      stock: availableStock,
    };
  }

  const availableStock = inventory.totalStock - inventory.reservedStock;

  if (availableStock < quantity) {
    throw new Error(`Insufficient stock. Available stock: ${availableStock}`);
  }

  return {
    available: true,
    stock: availableStock,
  };
};

export const deductStock = async ({
  productId,
  variantId = null,
  quantity,
  session = null,
}) => {
  if (!isValidObjectId(productId)) {
    throw new Error("Invalid product ID");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const options = {
    new: true,
    session,
  };

  if (variantId) {
    const inventory = await Inventory.findOneAndUpdate(
      {
        product: productId,
        variants: {
          $elemMatch: {
            variant: variantId,
            $expr: {
              $gte: [{ $subtract: ["$stock", "$reservedStock"] }, quantity],
            },
          },
        },
      },
      {
        $inc: {
          "variants.$.stock": -quantity,
          "variants.$.soldStock": quantity,
        },
      },
      options,
    );

    if (!inventory) {
      throw new Error("Insufficient variant stock");
    }

    return inventory;
  }

  const inventory = await Inventory.findOneAndUpdate(
    {
      product: productId,
      $expr: {
        $gte: [{ $subtract: ["$totalStock", "$reservedStock"] }, quantity],
      },
    },
    {
      $inc: {
        totalStock: -quantity,
        soldStock: quantity,
      },
    },
    options,
  );

  if (!inventory) {
    throw new Error("Insufficient stock");
  }

  return inventory;
};

export const restoreStock = async ({
  productId,
  variantId = null,
  quantity,
  session = null,
}) => {
  if (!isValidObjectId(productId)) {
    throw new Error("Invalid product ID");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const options = {
    new: true,
    session,
  };

  if (variantId) {
    const inventory = await Inventory.findOneAndUpdate(
      {
        product: productId,
        "variants.variant": variantId,
      },
      {
        $inc: {
          "variants.$.stock": quantity,
          "variants.$.soldStock": -quantity,
        },
      },
      options,
    );

    if (!inventory) {
      throw new Error("Inventory variant not found");
    }

    return inventory;
  }

  const inventory = await Inventory.findOneAndUpdate(
    {
      product: productId,
    },
    {
      $inc: {
        totalStock: quantity,
        soldStock: -quantity,
      },
    },
    options,
  );

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  return inventory;
};
