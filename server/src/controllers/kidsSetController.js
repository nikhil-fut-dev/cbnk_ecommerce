import mongoose from "mongoose";

import KidsSet from "../models/KidsSet.js";
import Category from "../models/Category.js";

import {
  getPublishedKidsSets,
  getAllKidsSets,
  getKidsSetById,
  createKidsSet,
  updateKidsSet,
  deleteKidsSet,
  toggleKidsSetStatus,
} from "../services/kidsSetService.js";

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

// PUBLIC
export const getKidsSets = async (req, res) => {
  try {
    const kidsSets = await getPublishedKidsSets();

    // Extra safety check:
    // Category must still be active and available.
    const filteredKidsSets = kidsSets.filter(
      (item) =>
        item.category &&
        item.category.isActive === true &&
        item.category.isDeleted === false,
    );

    return res.status(200).json({
      success: true,
      kidsSets: filteredKidsSets,
    });
  } catch (error) {
    console.error("Get Kids Sets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Kids Sets",
      errors: [error.message],
    });
  }
};

// ADMIN GET ALL
export const getAdminKidsSets = async (req, res) => {
  try {
    const kidsSets = await getAllKidsSets();

    return res.status(200).json({
      success: true,
      kidsSets,
    });
  } catch (error) {
    console.error("Get admin Kids Sets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Kids Sets",
      errors: [error.message],
    });
  }
};

// ADMIN GET SINGLE
export const getAdminKidsSetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Kids Set ID",
        errors: [],
      });
    }

    const kidsSet = await getKidsSetById(id);

    if (!kidsSet) {
      return res.status(404).json({
        success: false,
        message: "Kids Set not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      kidsSet,
    });
  } catch (error) {
    console.error("Get Kids Set by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Kids Set",
      errors: [error.message],
    });
  }
};

// ADMIN CREATE
export const createAdminKidsSet = async (req, res) => {
  let uploadedImage = null;

  try {
    const {
      title,
      description,
      category,
      sortOrder,
      isActive,
      status,
      startAt,
      endAt,
      imageAlt,
    } = req.body;

    // Title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
        errors: [],
      });
    }

    // Category
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
        errors: [],
      });
    }

    const validCategory = await validateCategory(category);

    if (!validCategory) {
      return res.status(400).json({
        success: false,
        message: "Category not found or category is inactive",
        errors: [],
      });
    }

    // Image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Kids Set image is required",
        errors: [],
      });
    }

    // Upload image
    uploadedImage = await uploadToCloudinary(
      req.file.buffer,
      "cbnk/home/kids-sets",
    );

    const kidsSet = await createKidsSet({
      title: title.trim(),

      description: description?.trim() || "",

      category,

      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,

      isActive:
        isActive === undefined
          ? true
          : isActive === true || isActive === "true",

      status: status || "DRAFT",

      startAt: startAt || null,

      endAt: endAt || null,

      image: {
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
        alt: imageAlt?.trim() || title.trim(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Kids Set created successfully",
      kidsSet,
    });
  } catch (error) {
    // If database operation fails after Cloudinary upload,
    // remove the newly uploaded image.
    if (uploadedImage?.publicId) {
      await deleteFromCloudinary(uploadedImage.publicId);
    }

    console.error("Create Kids Set error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Kids Set",
      errors: [error.message],
    });
  }
};

// ADMIN UPDATE
export const updateAdminKidsSet = async (req, res) => {
  let uploadedImage = null;

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Kids Set ID",
        errors: [],
      });
    }

    const existingKidsSet = await KidsSet.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingKidsSet) {
      return res.status(404).json({
        success: false,
        message: "Kids Set not found",
        errors: [],
      });
    }

    const {
      title,
      description,
      category,
      sortOrder,
      isActive,
      status,
      startAt,
      endAt,
      imageAlt,
    } = req.body;

    const updateData = {};

    // Title
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

    // Description
    if (description !== undefined) {
      updateData.description = description.trim();
    }

    // Category
    if (category !== undefined) {
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

    // Sort order
    if (sortOrder !== undefined) {
      updateData.sortOrder = Number(sortOrder);
    }

    // Active status
    if (isActive !== undefined) {
      updateData.isActive = isActive === true || isActive === "true";
    }

    // Publish status
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

    // Image alt text without replacing image
    if (imageAlt !== undefined) {
      updateData["image.alt"] = imageAlt.trim();
    }

    // New image
    if (req.file) {
      uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        "cbnk/home/kids-sets",
      );

      updateData.image = {
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
        alt:
          imageAlt?.trim() ||
          existingKidsSet.image?.alt ||
          existingKidsSet.title,
      };
    }

    const updatedKidsSet = await updateKidsSet(id, updateData);

    if (!updatedKidsSet) {
      if (uploadedImage?.publicId) {
        await deleteFromCloudinary(uploadedImage.publicId);
      }

      return res.status(404).json({
        success: false,
        message: "Kids Set not found",
        errors: [],
      });
    }

    // Delete old image only after
    // database update succeeds.
    if (uploadedImage?.publicId && existingKidsSet.image?.publicId) {
      await deleteFromCloudinary(existingKidsSet.image.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Kids Set updated successfully",
      kidsSet: updatedKidsSet,
    });
  } catch (error) {
    // Cleanup newly uploaded image
    // if update fails.
    if (uploadedImage?.publicId) {
      await deleteFromCloudinary(uploadedImage.publicId);
    }

    console.error("Update Kids Set error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Kids Set",
      errors: [error.message],
    });
  }
};

// ADMIN DELETE
export const deleteAdminKidsSet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Kids Set ID",
        errors: [],
      });
    }

    const existingKidsSet = await KidsSet.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingKidsSet) {
      return res.status(404).json({
        success: false,
        message: "Kids Set not found",
        errors: [],
      });
    }

    const kidsSet = await deleteKidsSet(id);

    if (kidsSet && existingKidsSet.image?.publicId) {
      await deleteFromCloudinary(existingKidsSet.image.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Kids Set deleted successfully",
      kidsSet,
    });
  } catch (error) {
    console.error("Delete Kids Set error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete Kids Set",
      errors: [error.message],
    });
  }
};

// ADMIN TOGGLE STATUS
export const toggleAdminKidsSetStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Kids Set ID",
        errors: [],
      });
    }

    const kidsSet = await toggleKidsSetStatus(id);

    if (!kidsSet) {
      return res.status(404).json({
        success: false,
        message: "Kids Set not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kids Set status updated successfully",
      kidsSet,
    });
  } catch (error) {
    console.error("Toggle Kids Set status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Kids Set status",
      errors: [error.message],
    });
  }
};
