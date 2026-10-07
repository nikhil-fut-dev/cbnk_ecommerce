import mongoose from "mongoose";

import PoloShop from "../models/PoloShop.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

import {
  getPublishedPoloShops,
  getAllPoloShops,
  getPoloShopById,
  createPoloShop,
  updatePoloShop,
  deletePoloShop,
  togglePoloShopStatus,
} from "../services/poloShopService.js";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";

// =====================================================
// Helpers
// =====================================================

const parseBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return value === "true";
};

const parseNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const validateCategory = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return null;
  }

  return Category.findOne({
    _id: categoryId,
    isActive: true,
  }).lean();
};

const validateProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return null;
  }

  return Product.findOne({
    _id: productId,
    isDeleted: false,
    isActive: true,
  }).lean();
};

// =====================================================
// PUBLIC
// Get Published Polo Shops
// =====================================================

export const getPoloShops = async (req, res) => {
  try {
    const poloShops = await getPublishedPoloShops();

    const safePoloShops = poloShops.filter((poloShop) => {
      const categoryValid = !poloShop.category || poloShop.category.isActive;

      const productValid =
        !poloShop.product ||
        (poloShop.product.isActive && !poloShop.product.isDeleted);

      return categoryValid && productValid;
    });

    return res.status(200).json({
      success: true,
      poloShops: safePoloShops,
    });
  } catch (error) {
    console.error("Get Polo Shops Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Polo Shops",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// Get All Polo Shops
// =====================================================

export const getAdminPoloShops = async (req, res) => {
  try {
    const poloShops = await getAllPoloShops();

    return res.status(200).json({
      success: true,
      poloShops,
    });
  } catch (error) {
    console.error("Get Admin Polo Shops Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Polo Shops",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// Get Single Polo Shop
// =====================================================

export const getAdminPoloShopById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Polo Shop ID",
        errors: [],
      });
    }

    const poloShop = await getPoloShopById(id);

    if (!poloShop) {
      return res.status(404).json({
        success: false,
        message: "Polo Shop not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      poloShop,
    });
  } catch (error) {
    console.error("Get Admin Polo Shop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Polo Shop",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// Create Polo Shop
// =====================================================

export const createAdminPoloShop = async (req, res) => {
  let desktopUpload = null;
  let mobileUpload = null;

  try {
    const {
      smallText,
      title,
      priceText,
      category,
      product,
      sortOrder,
      isActive,
      status,
      startAt,
      endAt,
      desktopImageAlt,
      mobileImageAlt,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
        errors: [],
      });
    }

    if (!category && !product) {
      return res.status(400).json({
        success: false,
        message: "Category or product is required",
        errors: [],
      });
    }

    // Validate category
    if (category) {
      const categoryExists = await validateCategory(category);

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive category",
          errors: [],
        });
      }
    }

    // Validate product
    if (product) {
      const productExists = await validateProduct(product);

      if (!productExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive product",
          errors: [],
        });
      }
    }

    // Images
    const desktopFile = req.files?.desktopImage?.[0];

    const mobileFile = req.files?.mobileImage?.[0];

    if (!desktopFile) {
      return res.status(400).json({
        success: false,
        message: "Desktop image is required",
        errors: [],
      });
    }

    if (!mobileFile) {
      return res.status(400).json({
        success: false,
        message: "Mobile image is required",
        errors: [],
      });
    }

    // Upload desktop image
    desktopUpload = await uploadToCloudinary(
      desktopFile.buffer,
      "cbnk/home/polo-shop",
    );

    // Upload mobile image
    mobileUpload = await uploadToCloudinary(
      mobileFile.buffer,
      "cbnk/home/polo-shop",
    );

    const poloShopData = {
      smallText: smallText?.trim() || "",

      title: title.trim(),

      priceText: priceText?.trim() || "",

      desktopImage: {
        url: desktopUpload.url,
        publicId: desktopUpload.publicId,
        alt: desktopImageAlt?.trim() || "",
      },

      mobileImage: {
        url: mobileUpload.url,
        publicId: mobileUpload.publicId,
        alt: mobileImageAlt?.trim() || "",
      },

      category: category || null,

      product: product || null,

      sortOrder: parseNumber(sortOrder, 0),

      isActive: parseBoolean(isActive, true),

      status: status || "DRAFT",

      startAt: startAt || null,

      endAt: endAt || null,
    };

    const poloShop = await createPoloShop(poloShopData);

    return res.status(201).json({
      success: true,
      message: "Polo Shop created successfully",
      poloShop,
    });
  } catch (error) {
    console.error("Create Polo Shop Error:", error);

    // Cleanup uploaded images
    if (desktopUpload?.publicId) {
      await deleteFromCloudinary(desktopUpload.publicId);
    }

    if (mobileUpload?.publicId) {
      await deleteFromCloudinary(mobileUpload.publicId);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create Polo Shop",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// Update Polo Shop
// =====================================================

export const updateAdminPoloShop = async (req, res) => {
  let newDesktopUpload = null;
  let newMobileUpload = null;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Polo Shop ID",
        errors: [],
      });
    }

    const existing = await PoloShop.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Polo Shop not found",
        errors: [],
      });
    }

    const {
      smallText,
      title,
      priceText,
      category,
      product,
      sortOrder,
      isActive,
      status,
      startAt,
      endAt,
      desktopImageAlt,
      mobileImageAlt,
    } = req.body;

    // ---------------------------------------------
    // Validate title
    // ---------------------------------------------

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
        errors: [],
      });
    }

    // ---------------------------------------------
    // Category
    // ---------------------------------------------

    let finalCategory = existing.category;

    if (category !== undefined) {
      if (category === "") {
        finalCategory = null;
      } else {
        const categoryExists = await validateCategory(category);

        if (!categoryExists) {
          return res.status(400).json({
            success: false,
            message: "Invalid or inactive category",
            errors: [],
          });
        }

        finalCategory = category;
      }
    }

    // ---------------------------------------------
    // Product
    // ---------------------------------------------

    let finalProduct = existing.product;

    if (product !== undefined) {
      if (product === "") {
        finalProduct = null;
      } else {
        const productExists = await validateProduct(product);

        if (!productExists) {
          return res.status(400).json({
            success: false,
            message: "Invalid or inactive product",
            errors: [],
          });
        }

        finalProduct = product;
      }
    }

    // At least one relation must remain
    if (!finalCategory && !finalProduct) {
      return res.status(400).json({
        success: false,
        message: "Category or product is required",
        errors: [],
      });
    }

    const updateData = {};

    if (smallText !== undefined) {
      updateData.smallText = smallText.trim();
    }

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (priceText !== undefined) {
      updateData.priceText = priceText.trim();
    }

    if (category !== undefined) {
      updateData.category = finalCategory;
    }

    if (product !== undefined) {
      updateData.product = finalProduct;
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = parseNumber(sortOrder, existing.sortOrder);
    }

    if (isActive !== undefined) {
      updateData.isActive = parseBoolean(isActive, existing.isActive);
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (startAt !== undefined) {
      updateData.startAt = startAt || null;
    }

    if (endAt !== undefined) {
      updateData.endAt = endAt || null;
    }

    // ---------------------------------------------
    // Alt text update
    // ---------------------------------------------

    if (desktopImageAlt !== undefined) {
      updateData.desktopImage = {
        ...existing.desktopImage.toObject(),
        alt: desktopImageAlt.trim(),
      };
    }

    if (mobileImageAlt !== undefined) {
      updateData.mobileImage = {
        ...existing.mobileImage.toObject(),
        alt: mobileImageAlt.trim(),
      };
    }

    // ---------------------------------------------
    // Desktop image replacement
    // ---------------------------------------------

    const desktopFile = req.files?.desktopImage?.[0];

    if (desktopFile) {
      newDesktopUpload = await uploadToCloudinary(
        desktopFile.buffer,
        "cbnk/home/polo-shop",
      );

      updateData.desktopImage = {
        url: newDesktopUpload.url,
        publicId: newDesktopUpload.publicId,
        alt:
          desktopImageAlt !== undefined
            ? desktopImageAlt.trim()
            : existing.desktopImage.alt,
      };
    }

    // ---------------------------------------------
    // Mobile image replacement
    // ---------------------------------------------

    const mobileFile = req.files?.mobileImage?.[0];

    if (mobileFile) {
      newMobileUpload = await uploadToCloudinary(
        mobileFile.buffer,
        "cbnk/home/polo-shop",
      );

      updateData.mobileImage = {
        url: newMobileUpload.url,
        publicId: newMobileUpload.publicId,
        alt:
          mobileImageAlt !== undefined
            ? mobileImageAlt.trim()
            : existing.mobileImage.alt,
      };
    }

    // ---------------------------------------------
    // Update database
    // ---------------------------------------------

    const updatedPoloShop = await updatePoloShop(id, updateData);

    if (!updatedPoloShop) {
      throw new Error("Polo Shop update failed");
    }

    // ---------------------------------------------
    // Delete old desktop image
    // ---------------------------------------------

    if (newDesktopUpload && existing.desktopImage?.publicId) {
      await deleteFromCloudinary(existing.desktopImage.publicId);
    }

    // ---------------------------------------------
    // Delete old mobile image
    // ---------------------------------------------

    if (newMobileUpload && existing.mobileImage?.publicId) {
      await deleteFromCloudinary(existing.mobileImage.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Polo Shop updated successfully",
      poloShop: updatedPoloShop,
    });
  } catch (error) {
    console.error("Update Polo Shop Error:", error);

    // Cleanup newly uploaded images
    if (newDesktopUpload?.publicId) {
      await deleteFromCloudinary(newDesktopUpload.publicId);
    }

    if (newMobileUpload?.publicId) {
      await deleteFromCloudinary(newMobileUpload.publicId);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update Polo Shop",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// Delete Polo Shop
// =====================================================

export const deleteAdminPoloShop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Polo Shop ID",
        errors: [],
      });
    }

    const poloShop = await deletePoloShop(id);

    if (!poloShop) {
      return res.status(404).json({
        success: false,
        message: "Polo Shop not found",
        errors: [],
      });
    }

    // Delete desktop image
    if (poloShop.desktopImage?.publicId) {
      await deleteFromCloudinary(poloShop.desktopImage.publicId);
    }

    // Delete mobile image
    if (poloShop.mobileImage?.publicId) {
      await deleteFromCloudinary(poloShop.mobileImage.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Polo Shop deleted successfully",
    });
  } catch (error) {
    console.error("Delete Polo Shop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete Polo Shop",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// Toggle Status
// =====================================================

export const toggleAdminPoloShopStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Polo Shop ID",
        errors: [],
      });
    }

    const poloShop = await togglePoloShopStatus(id);

    if (!poloShop) {
      return res.status(404).json({
        success: false,
        message: "Polo Shop not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Polo Shop status updated successfully",
      poloShop,
    });
  } catch (error) {
    console.error("Toggle Polo Shop Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Polo Shop status",
      errors: [error.message],
    });
  }
};
