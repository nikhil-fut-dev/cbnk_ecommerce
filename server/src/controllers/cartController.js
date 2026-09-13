import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { checkStock } from "../services/inventoryService.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
};

const findMatchingItem = (cart, productId, variantId, size, color) => {
  return cart.items.find((item) => {
    const sameProduct = item.product.toString() === productId.toString();

    const sameVariant =
      (item.variant?.toString() || null) === (variantId?.toString() || null);

    const sameSize = (item.size || "") === (size || "");
    const sameColor = (item.color || "") === (color || "");

    return sameProduct && sameVariant && sameSize && sameColor;
  });
};

export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);

    await cart.populate({
      path: "items.product",
      select:
        "name slug price compareAtPrice images stock sizes colors variants isActive isDeleted",
    });

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const {
      productId,
      variantId = null,
      size = "",
      color = "",
      quantity = 1,
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let selectedPrice = product.price;

    if (variantId) {
      const variant = product.variants.id(variantId);

      if (!variant || !variant.isActive) {
        return res.status(404).json({
          success: false,
          message: "Product variant not found",
        });
      }

      selectedPrice = variant.price !== null ? variant.price : product.price;
    }

    const stockResult = await checkStock({
      productId,
      variantId,
      quantity: parsedQuantity,
    });

    if (!stockResult.available) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
        availableStock: stockResult.availableStock,
      });
    }

    const selectedStock = stockResult.availableStock;

    const cart = await getOrCreateCart(req.user._id);

    const existingItem = findMatchingItem(
      cart,
      productId,
      variantId,
      size,
      color,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + parsedQuantity;

      if (newQuantity > selectedStock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock",
        });
      }

      existingItem.quantity = newQuantity;
      existingItem.price = selectedPrice;
    } else {
      cart.items.push({
        product: productId,
        variant: variantId,
        size,
        color,
        quantity: parsedQuantity,
        price: selectedPrice,
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select:
        "name slug price compareAtPrice images stock sizes colors variants isActive isDeleted",
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const product = await Product.findOne({
      _id: item.product,
      isActive: true,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product is no longer available",
      });
    }

    let variant = null;

    if (item.variant) {
      variant = product.variants.id(item.variant);

      if (!variant || !variant.isActive) {
        return res.status(400).json({
          success: false,
          message: "Selected variant is no longer available",
        });
      }

      item.price = variant.price !== null ? variant.price : product.price;
    } else {
      item.price = product.price;
    }

    const stockResult = await checkStock({
      productId: item.product,
      variantId: item.variant,
      quantity: parsedQuantity,
    });

    if (!stockResult.available) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
        availableStock: stockResult.availableStock,
      });
    }

    item.quantity = parsedQuantity;

    await cart.save();

    await cart.populate({
      path: "items.product",
      select:
        "name slug price compareAtPrice images stock sizes colors variants isActive isDeleted",
    });

    return res.status(200).json({
      success: true,
      message: "Cart item updated",
      cart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.deleteOne();

    await cart.save();

    await cart.populate({
      path: "items.product",
      select:
        "name slug price compareAtPrice images stock sizes colors variants isActive isDeleted",
    });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove cart item",
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty",
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};
