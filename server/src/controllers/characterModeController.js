import mongoose from "mongoose";

import CharacterMode from "../models/CharacterMode.js";
import Category from "../models/Category.js";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";

import {
  getPublishedCharacterModes,
  getAllCharacterModes,
  getCharacterModeById,
  createCharacterMode,
  updateCharacterMode,
  deleteCharacterMode,
  toggleCharacterModeStatus,
} from "../services/characterModeService.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/* =========================================================
   CATEGORY VALIDATION
========================================================= */

const validateCategory = async (categoryId) => {
  if (!categoryId) {
    return null;
  }

  if (!isValidObjectId(categoryId)) {
    return {
      error: "Invalid category ID",
    };
  }

  const category = await Category.findOne({
    _id: categoryId,
    isDeleted: false,
    isActive: true,
  }).lean();

  if (!category) {
    return {
      error: "Selected category does not exist or is inactive",
    };
  }

  return {
    category,
  };
};

/* =========================================================
   CUSTOMER
========================================================= */

export const getCharacterModes = async (req, res) => {
  try {
    const characterModes = await getPublishedCharacterModes();

    /*
     * Safety filter:
     * Agar linked category later inactive/deleted ho
     * jaye, customer ko card nahi dikhayenge.
     */
    const validCharacterModes = characterModes.filter(
      (item) =>
        item.category &&
        item.category.isActive === true &&
        item.category.isDeleted === false,
    );

    return res.status(200).json({
      success: true,
      message: "Character modes fetched successfully",
      data: validCharacterModes,
    });
  } catch (error) {
    console.error("Get character modes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch character modes",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - GET ALL
========================================================= */

export const getAdminCharacterModes = async (req, res) => {
  try {
    const characterModes = await getAllCharacterModes();

    return res.status(200).json({
      success: true,
      message: "Character modes fetched successfully",
      data: characterModes,
    });
  } catch (error) {
    console.error("Get admin character modes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch character modes",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - GET SINGLE
========================================================= */

export const getAdminCharacterModeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid character mode ID",
        errors: [],
      });
    }

    const characterMode = await getCharacterModeById(id);

    if (!characterMode) {
      return res.status(404).json({
        success: false,
        message: "Character mode not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Character mode fetched successfully",
      data: characterMode,
    });
  } catch (error) {
    console.error("Get admin character mode error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch character mode",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - CREATE
========================================================= */

export const createAdminCharacterMode = async (req, res) => {
  let imageUpload = null;

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

    /* -----------------------------------------------
         Basic validation
      ------------------------------------------------ */

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Character mode title is required",
        errors: [],
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
        errors: [],
      });
    }

    /* -----------------------------------------------
         Category validation
      ------------------------------------------------ */

    const categoryResult = await validateCategory(category);

    if (categoryResult.error) {
      return res.status(400).json({
        success: false,
        message: categoryResult.error,
        errors: [],
      });
    }

    /* -----------------------------------------------
         Image validation
      ------------------------------------------------ */

    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Character mode image is required",
        errors: [],
      });
    }

    /* -----------------------------------------------
         Cloudinary upload
      ------------------------------------------------ */

    imageUpload = await uploadToCloudinary(
      imageFile.buffer,
      "cbnk/home/character-mode",
    );

    /* -----------------------------------------------
         Create database record
      ------------------------------------------------ */

    const characterMode = await createCharacterMode({
      title,
      description,

      category,

      image: {
        url: imageUpload.url,
        publicId: imageUpload.publicId,
        alt: imageAlt || "",
      },

      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,

      isActive:
        isActive !== undefined
          ? isActive === "true" || isActive === true
          : true,

      status: status || "DRAFT",

      startAt: startAt || null,

      endAt: endAt || null,
    });

    return res.status(201).json({
      success: true,
      message: "Character mode created successfully",
      data: characterMode,
    });
  } catch (error) {
    console.error("Create admin character mode error:", error);

    /*
     * Database failure ke case me uploaded image
     * cleanup karna.
     */
    if (imageUpload?.publicId) {
      await deleteFromCloudinary(imageUpload.publicId);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create character mode",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - UPDATE
========================================================= */

export const updateAdminCharacterMode = async (req, res) => {
  let newImageUpload = null;

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid character mode ID",
        errors: [],
      });
    }

    const existingCharacterMode = await getCharacterModeById(id);

    if (!existingCharacterMode) {
      return res.status(404).json({
        success: false,
        message: "Character mode not found",
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

    /* -----------------------------------------------
         Title validation
      ------------------------------------------------ */

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Character mode title cannot be empty",
        errors: [],
      });
    }

    /* -----------------------------------------------
         Category validation
      ------------------------------------------------ */

    if (category !== undefined) {
      const categoryResult = await validateCategory(category);

      if (categoryResult.error) {
        return res.status(400).json({
          success: false,
          message: categoryResult.error,
          errors: [],
        });
      }
    }

    const updateData = {};

    /* -----------------------------------------------
         Text fields
      ------------------------------------------------ */

    if (title !== undefined) {
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = Number(sortOrder);
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive === "true" || isActive === true;
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

    /* -----------------------------------------------
         Image
      ------------------------------------------------ */

    const imageFile = req.file;

    if (imageFile) {
      newImageUpload = await uploadToCloudinary(
        imageFile.buffer,
        "cbnk/home/character-mode",
      );

      updateData.image = {
        url: newImageUpload.url,
        publicId: newImageUpload.publicId,
        alt:
          imageAlt !== undefined
            ? imageAlt
            : existingCharacterMode.image?.alt || "",
      };
    } else if (imageAlt !== undefined) {
      updateData.image = {
        ...existingCharacterMode.image,
        alt: imageAlt,
      };
    }

    /* -----------------------------------------------
         Database update
      ------------------------------------------------ */

    const updatedCharacterMode = await updateCharacterMode(id, updateData);

    if (!updatedCharacterMode) {
      if (newImageUpload?.publicId) {
        await deleteFromCloudinary(newImageUpload.publicId);
      }

      return res.status(404).json({
        success: false,
        message: "Character mode not found",
        errors: [],
      });
    }

    /* -----------------------------------------------
         Delete old image after successful update
      ------------------------------------------------ */

    if (newImageUpload?.publicId && existingCharacterMode.image?.publicId) {
      await deleteFromCloudinary(existingCharacterMode.image.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Character mode updated successfully",
      data: updatedCharacterMode,
    });
  } catch (error) {
    console.error("Update admin character mode error:", error);

    /*
     * New image upload hui but DB update fail hua.
     */
    if (newImageUpload?.publicId) {
      await deleteFromCloudinary(newImageUpload.publicId);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update character mode",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - DELETE
========================================================= */

export const deleteAdminCharacterMode = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid character mode ID",
        errors: [],
      });
    }

    const characterMode = await getCharacterModeById(id);

    if (!characterMode) {
      return res.status(404).json({
        success: false,
        message: "Character mode not found",
        errors: [],
      });
    }

    const deletedCharacterMode = await deleteCharacterMode(id);

    /* -----------------------------------------------
         Cloudinary cleanup
      ------------------------------------------------ */

    if (characterMode.image?.publicId) {
      await deleteFromCloudinary(characterMode.image.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Character mode deleted successfully",
      data: deletedCharacterMode,
    });
  } catch (error) {
    console.error("Delete admin character mode error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete character mode",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - TOGGLE STATUS
========================================================= */

export const toggleAdminCharacterModeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid character mode ID",
        errors: [],
      });
    }

    const characterMode = await toggleCharacterModeStatus(id);

    if (!characterMode) {
      return res.status(404).json({
        success: false,
        message: "Character mode not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Character mode status updated successfully",
      data: characterMode,
    });
  } catch (error) {
    console.error("Toggle character mode status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update character mode status",
      errors: [error.message],
    });
  }
};
