import mongoose from "mongoose";

import SleepwearEdit from "../models/SleepwearEdit.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

import {
  getPublishedSleepwearEdits,
  getAllSleepwearEdits,
  getSleepwearEditById,
  createSleepwearEdit,
  updateSleepwearEdit,
  deleteSleepwearEdit,
  toggleSleepwearEditStatus,
} from "../services/sleepwearEditService.js";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate category
const validateCategory = async (categoryId) => {
  if (!isValidObjectId(categoryId)) {
    return null;
  }

  return Category.findOne({
    _id: categoryId,
    isDeleted: false,
    isActive: true,
  }).lean();
};

// Validate product
const validateProduct = async (productId) => {
  if (!isValidObjectId(productId)) {
    return null;
  }

  return Product.findOne({
    _id: productId,
    isDeleted: false,
    isActive: true,
  }).lean();
};

// PUBLIC
export const getSleepwearEdits = async (req, res) => {
  try {
    const sleepwearEdits = await getPublishedSleepwearEdits();

    // Extra safety:
    // remove records whose linked category
    // or product is no longer active.
    const filteredSleepwearEdits = sleepwearEdits.filter((item) => {
      const categoryValid =
        !item.category ||
        (item.category.isActive === true && item.category.isDeleted === false);

      const productValid =
        !item.product ||
        (item.product.isActive === true && item.product.isDeleted === false);

      return categoryValid && productValid;
    });

    return res.status(200).json({
      success: true,
      sleepwearEdits: filteredSleepwearEdits,
    });
  } catch (error) {
    console.error("Get Sleepwear Edit error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Sleepwear Edit",
      errors: [error.message],
    });
  }
};

// ADMIN GET ALL
export const getAdminSleepwearEdits = async (req, res) => {
  try {
    const sleepwearEdits = await getAllSleepwearEdits();

    return res.status(200).json({
      success: true,
      sleepwearEdits,
    });
  } catch (error) {
    console.error("Get admin Sleepwear Edit error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Sleepwear Edit",
      errors: [error.message],
    });
  }
};

// ADMIN GET SINGLE
export const getAdminSleepwearEditById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Sleepwear Edit ID",
        errors: [],
      });
    }

    const sleepwearEdit = await getSleepwearEditById(id);

    if (!sleepwearEdit) {
      return res.status(404).json({
        success: false,
        message: "Sleepwear Edit not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      sleepwearEdit,
    });
  } catch (error) {
    console.error("Get Sleepwear Edit by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Sleepwear Edit",
      errors: [error.message],
    });
  }
};

// ADMIN CREATE
export const createAdminSleepwearEdit = async (req, res) => {
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

    // Title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
        errors: [],
      });
    }

    // At least one relation
    if (!category && !product) {
      return res.status(400).json({
        success: false,
        message: "Category or product is required",
        errors: [],
      });
    }

    // Validate category if provided
    if (category) {
      const validCategory = await validateCategory(category);

      if (!validCategory) {
        return res.status(400).json({
          success: false,
          message: "Category not found or category is inactive",
          errors: [],
        });
      }
    }

    // Validate product if provided
    if (product) {
      const validProduct = await validateProduct(product);

      if (!validProduct) {
        return res.status(400).json({
          success: false,
          message: "Product not found or product is inactive",
          errors: [],
        });
      }
    }

    // Desktop + mobile images required
    if (!req.files?.desktopImage?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Desktop image is required",
        errors: [],
      });
    }

    if (!req.files?.mobileImage?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Mobile image is required",
        errors: [],
      });
    }

    // Upload desktop
    desktopUpload = await uploadToCloudinary(
      req.files.desktopImage[0].buffer,
      "cbnk/home/sleepwear",
    );

    // Upload mobile
    mobileUpload = await uploadToCloudinary(
      req.files.mobileImage[0].buffer,
      "cbnk/home/sleepwear",
    );

    const sleepwearEdit = await createSleepwearEdit({
      smallText: smallText?.trim() || "",

      title: title.trim(),

      priceText: priceText?.trim() || "",

      category: category || null,

      product: product || null,

      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,

      isActive:
        isActive === undefined
          ? true
          : isActive === true || isActive === "true",

      status: status || "DRAFT",

      startAt: startAt || null,

      endAt: endAt || null,

      desktopImage: {
        url: desktopUpload.url,
        publicId: desktopUpload.publicId,
        alt: desktopImageAlt?.trim() || title.trim(),
      },

      mobileImage: {
        url: mobileUpload.url,
        publicId: mobileUpload.publicId,
        alt: mobileImageAlt?.trim() || title.trim(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Sleepwear Edit created successfully",
      sleepwearEdit,
    });
  } catch (error) {
    // Cleanup uploaded images if DB creation fails.
    if (desktopUpload?.publicId) {
      await deleteFromCloudinary(desktopUpload.publicId);
    }

    if (mobileUpload?.publicId) {
      await deleteFromCloudinary(mobileUpload.publicId);
    }

    console.error("Create Sleepwear Edit error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Sleepwear Edit",
      errors: [error.message],
    });
  }
};

// ADMIN UPDATE
export const updateAdminSleepwearEdit = async (req, res) => {
  let desktopUpload = null;
  let mobileUpload = null;

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Sleepwear Edit ID",
        errors: [],
      });
    }

    const existingSleepwear = await SleepwearEdit.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingSleepwear) {
      return res.status(404).json({
        success: false,
        message: "Sleepwear Edit not found",
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

    const updateData = {};

    // Text fields
    if (smallText !== undefined) {
      updateData.smallText = smallText.trim();
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
          errors: [],
        });
      }

      updateData.title = title.trim();
    }

    if (priceText !== undefined) {
      updateData.priceText = priceText.trim();
    }

    // Category
    if (category !== undefined) {
      if (category === "") {
        updateData.category = null;
      } else {
        const validCategory = await validateCategory(category);

        if (!validCategory) {
          return res.status(400).json({
            success: false,
            message: "Category not found or category is inactive",
            errors: [],
          });
        }

        updateData.category = category;
      }
    }

    // Product
    if (product !== undefined) {
      if (product === "") {
        updateData.product = null;
      } else {
        const validProduct = await validateProduct(product);

        if (!validProduct) {
          return res.status(400).json({
            success: false,
            message: "Product not found or product is inactive",
            errors: [],
          });
        }

        updateData.product = product;
      }
    }

    // Prevent a record from having
    // neither category nor product.
    const finalCategory =
      category !== undefined ? category : existingSleepwear.category;

    const finalProduct =
      product !== undefined ? product : existingSleepwear.product;

    if (!finalCategory && !finalProduct) {
      return res.status(400).json({
        success: false,
        message: "Category or product is required",
        errors: [],
      });
    }

    // Sort order
    if (sortOrder !== undefined) {
      updateData.sortOrder = Number(sortOrder);
    }

    // Active
    if (isActive !== undefined) {
      updateData.isActive = isActive === true || isActive === "true";
    }

    // Status
    if (status !== undefined) {
      updateData.status = status;
    }

    // Schedule
    if (startAt !== undefined) {
      updateData.startAt = startAt || null;
    }

    if (endAt !== undefined) {
      updateData.endAt = endAt || null;
    }

    // Alt text without image replacement
    if (desktopImageAlt !== undefined) {
      updateData["desktopImage.alt"] = desktopImageAlt.trim();
    }

    if (mobileImageAlt !== undefined) {
      updateData["mobileImage.alt"] = mobileImageAlt.trim();
    }

    // New desktop image
    if (req.files?.desktopImage?.[0]) {
      desktopUpload = await uploadToCloudinary(
        req.files.desktopImage[0].buffer,
        "cbnk/home/sleepwear",
      );

      updateData.desktopImage = {
        url: desktopUpload.url,
        publicId: desktopUpload.publicId,
        alt:
          desktopImageAlt?.trim() ||
          existingSleepwear.desktopImage?.alt ||
          existingSleepwear.title,
      };
    }

    // New mobile image
    if (req.files?.mobileImage?.[0]) {
      mobileUpload = await uploadToCloudinary(
        req.files.mobileImage[0].buffer,
        "cbnk/home/sleepwear",
      );

      updateData.mobileImage = {
        url: mobileUpload.url,
        publicId: mobileUpload.publicId,
        alt:
          mobileImageAlt?.trim() ||
          existingSleepwear.mobileImage?.alt ||
          existingSleepwear.title,
      };
    }

    const updatedSleepwear = await updateSleepwearEdit(id, updateData);

    if (!updatedSleepwear) {
      if (desktopUpload?.publicId) {
        await deleteFromCloudinary(desktopUpload.publicId);
      }

      if (mobileUpload?.publicId) {
        await deleteFromCloudinary(mobileUpload.publicId);
      }

      return res.status(404).json({
        success: false,
        message: "Sleepwear Edit not found",
        errors: [],
      });
    }

    // Delete old desktop image
    // only after successful DB update.
    if (desktopUpload?.publicId && existingSleepwear.desktopImage?.publicId) {
      await deleteFromCloudinary(existingSleepwear.desktopImage.publicId);
    }

    // Delete old mobile image
    // only after successful DB update.
    if (mobileUpload?.publicId && existingSleepwear.mobileImage?.publicId) {
      await deleteFromCloudinary(existingSleepwear.mobileImage.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Sleepwear Edit updated successfully",
      sleepwearEdit: updatedSleepwear,
    });
  } catch (error) {
    // Cleanup newly uploaded images
    // if update fails.
    if (desktopUpload?.publicId) {
      await deleteFromCloudinary(desktopUpload.publicId);
    }

    if (mobileUpload?.publicId) {
      await deleteFromCloudinary(mobileUpload.publicId);
    }

    console.error("Update Sleepwear Edit error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Sleepwear Edit",
      errors: [error.message],
    });
  }
};

// ADMIN DELETE
export const deleteAdminSleepwearEdit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Sleepwear Edit ID",
        errors: [],
      });
    }

    const existingSleepwear = await SleepwearEdit.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingSleepwear) {
      return res.status(404).json({
        success: false,
        message: "Sleepwear Edit not found",
        errors: [],
      });
    }

    const sleepwearEdit = await deleteSleepwearEdit(id);

    if (sleepwearEdit && existingSleepwear.desktopImage?.publicId) {
      await deleteFromCloudinary(existingSleepwear.desktopImage.publicId);
    }

    if (sleepwearEdit && existingSleepwear.mobileImage?.publicId) {
      await deleteFromCloudinary(existingSleepwear.mobileImage.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Sleepwear Edit deleted successfully",
      sleepwearEdit,
    });
  } catch (error) {
    console.error("Delete Sleepwear Edit error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete Sleepwear Edit",
      errors: [error.message],
    });
  }
};

// ADMIN TOGGLE STATUS
export const toggleAdminSleepwearEditStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Sleepwear Edit ID",
        errors: [],
      });
    }

    const sleepwearEdit = await toggleSleepwearEditStatus(id);

    if (!sleepwearEdit) {
      return res.status(404).json({
        success: false,
        message: "Sleepwear Edit not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sleepwear Edit status updated successfully",
      sleepwearEdit,
    });
  } catch (error) {
    console.error("Toggle Sleepwear Edit status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Sleepwear Edit status",
      errors: [error.message],
    });
  }
};
