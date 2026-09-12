import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [],
    });
  }

  return wishlist;
};

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);

    await wishlist.populate({
      path: "products",
      select:
        "name slug price compareAtPrice discount images rating reviewCount stock sizes colors isFeatured isNew isBestSeller isActive isDeleted",
    });

    // Remove products which are no longer active.
    wishlist.products = wishlist.products.filter(
      (product) => product && product.isActive && !product.isDeleted,
    );

    return res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
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

    const wishlist = await getOrCreateWishlist(req.user._id);

    const alreadyExists = wishlist.products.some(
      (id) => id.toString() === productId.toString(),
    );

    if (alreadyExists) {
      return res.status(200).json({
        success: true,
        message: "Product is already in wishlist",
        wishlist,
      });
    }

    wishlist.products.push(productId);

    await wishlist.save();

    await wishlist.populate({
      path: "products",
      select:
        "name slug price compareAtPrice discount images rating reviewCount stock sizes colors isFeatured isNew isBestSeller isActive isDeleted",
    });

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const exists = wishlist.products.some(
      (id) => id.toString() === productId.toString(),
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product is not in wishlist",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId.toString(),
    );

    await wishlist.save();

    await wishlist.populate({
      path: "products",
      select:
        "name slug price compareAtPrice discount images rating reviewCount stock sizes colors isFeatured isNew isBestSeller isActive isDeleted",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is already empty",
      });
    }

    wishlist.products = [];

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
    });
  }
};
