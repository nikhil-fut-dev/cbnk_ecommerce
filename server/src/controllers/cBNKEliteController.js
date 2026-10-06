import mongoose from "mongoose";

import {
  getPublishedCBNKElite,
  getAllCBNKElite,
  getCBNKEliteById,
  createCBNKElite,
  updateCBNKElite,
  deleteCBNKElite,
  toggleCBNKEliteStatus,
} from "../services/cBNKEliteService.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =========================================================
// PUBLIC
// GET /api/v1/home/elite
// =========================================================

export const getCBNKElite = async (req, res) => {
  try {
    const elite = await getPublishedCBNKElite();

    return res.status(200).json({
      success: true,
      elite,
    });
  } catch (error) {
    console.error("Get CBNK Elite error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch CBNK Elite",
      errors: [error.message],
    });
  }
};

// =========================================================
// ADMIN
// GET ALL
// =========================================================

export const getAdminCBNKElite = async (req, res) => {
  try {
    const elite = await getAllCBNKElite();

    return res.status(200).json({
      success: true,
      elite,
    });
  } catch (error) {
    console.error("Get admin CBNK Elite error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch CBNK Elite",
      errors: [error.message],
    });
  }
};

// =========================================================
// ADMIN
// GET SINGLE
// =========================================================

export const getAdminCBNKEliteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid CBNK Elite ID",
        errors: [],
      });
    }

    const elite = await getCBNKEliteById(id);

    if (!elite) {
      return res.status(404).json({
        success: false,
        message: "CBNK Elite not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      elite,
    });
  } catch (error) {
    console.error("Get CBNK Elite by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch CBNK Elite",
      errors: [error.message],
    });
  }
};

// =========================================================
// ADMIN
// CREATE
// =========================================================

export const createAdminCBNKElite = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      benefits,
      originalPrice,
      sellingPrice,
      validityMonths,
      taxText,
      validityText,
      logo,
      ctaText,
      ctaLink,
      isActive,
      status,
      startAt,
      endAt,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
        errors: [],
      });
    }

    if (
      originalPrice === undefined ||
      originalPrice === null ||
      originalPrice === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Original price is required",
        errors: [],
      });
    }

    if (
      sellingPrice === undefined ||
      sellingPrice === null ||
      sellingPrice === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Selling price is required",
        errors: [],
      });
    }

    let parsedBenefits = benefits;

    if (typeof benefits === "string") {
      try {
        parsedBenefits = JSON.parse(benefits);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Benefits must be valid JSON",
          errors: [],
        });
      }
    }

    let parsedLogo = logo;

    if (typeof logo === "string") {
      try {
        parsedLogo = JSON.parse(logo);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Logo must be valid JSON",
          errors: [],
        });
      }
    }

    const elite = await createCBNKElite({
      title: title.trim(),
      subtitle: subtitle?.trim() || "",
      description: description?.trim() || "",
      benefits: Array.isArray(parsedBenefits) ? parsedBenefits : [],
      originalPrice: Number(originalPrice),
      sellingPrice: Number(sellingPrice),
      validityMonths:
        validityMonths !== undefined ? Number(validityMonths) : 12,
      taxText: taxText?.trim() || "Inclusive of all taxes",
      validityText: validityText?.trim() || "",
      logo: parsedLogo || undefined,
      ctaText: ctaText?.trim() || "Join Elite",
      ctaLink: ctaLink?.trim() || "",
      isActive:
        isActive === undefined
          ? true
          : isActive === true || isActive === "true",
      status: status || "DRAFT",
      startAt: startAt || null,
      endAt: endAt || null,
    });

    return res.status(201).json({
      success: true,
      message: "CBNK Elite created successfully",
      elite,
    });
  } catch (error) {
    console.error("Create CBNK Elite error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create CBNK Elite",
      errors: [error.message],
    });
  }
};

// =========================================================
// ADMIN
// UPDATE
// =========================================================

export const updateAdminCBNKElite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid CBNK Elite ID",
        errors: [],
      });
    }

    const existingElite = await getCBNKEliteById(id);

    if (!existingElite) {
      return res.status(404).json({
        success: false,
        message: "CBNK Elite not found",
        errors: [],
      });
    }

    const updateData = {};

    const fields = [
      "title",
      "subtitle",
      "description",
      "originalPrice",
      "sellingPrice",
      "validityMonths",
      "taxText",
      "validityText",
      "ctaText",
      "ctaLink",
      "startAt",
      "endAt",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    });

    if (req.body.isActive !== undefined) {
      updateData.isActive =
        req.body.isActive === true || req.body.isActive === "true";
    }

    if (req.body.originalPrice !== undefined) {
      updateData.originalPrice = Number(req.body.originalPrice);
    }

    if (req.body.sellingPrice !== undefined) {
      updateData.sellingPrice = Number(req.body.sellingPrice);
    }

    if (req.body.validityMonths !== undefined) {
      updateData.validityMonths = Number(req.body.validityMonths);
    }

    if (req.body.benefits !== undefined) {
      let parsedBenefits = req.body.benefits;

      if (typeof parsedBenefits === "string") {
        try {
          parsedBenefits = JSON.parse(parsedBenefits);
        } catch {
          return res.status(400).json({
            success: false,
            message: "Benefits must be valid JSON",
            errors: [],
          });
        }
      }

      if (!Array.isArray(parsedBenefits)) {
        return res.status(400).json({
          success: false,
          message: "Benefits must be an array",
          errors: [],
        });
      }

      updateData.benefits = parsedBenefits;
    }

    if (req.body.logo !== undefined) {
      let parsedLogo = req.body.logo;

      if (typeof parsedLogo === "string") {
        try {
          parsedLogo = JSON.parse(parsedLogo);
        } catch {
          return res.status(400).json({
            success: false,
            message: "Logo must be valid JSON",
            errors: [],
          });
        }
      }

      updateData.logo = parsedLogo;
    }

    const elite = await updateCBNKElite(id, updateData);

    return res.status(200).json({
      success: true,
      message: "CBNK Elite updated successfully",
      elite,
    });
  } catch (error) {
    console.error("Update CBNK Elite error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update CBNK Elite",
      errors: [error.message],
    });
  }
};

// =========================================================
// ADMIN
// DELETE
// =========================================================

export const deleteAdminCBNKElite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid CBNK Elite ID",
        errors: [],
      });
    }

    const elite = await deleteCBNKElite(id);

    if (!elite) {
      return res.status(404).json({
        success: false,
        message: "CBNK Elite not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "CBNK Elite deleted successfully",
      elite,
    });
  } catch (error) {
    console.error("Delete CBNK Elite error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete CBNK Elite",
      errors: [error.message],
    });
  }
};

// =========================================================
// ADMIN
// TOGGLE STATUS
// =========================================================

export const toggleAdminCBNKEliteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid CBNK Elite ID",
        errors: [],
      });
    }

    const elite = await toggleCBNKEliteStatus(id);

    if (!elite) {
      return res.status(404).json({
        success: false,
        message: "CBNK Elite not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "CBNK Elite status updated successfully",
      elite,
    });
  } catch (error) {
    console.error("Toggle CBNK Elite status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update CBNK Elite status",
      errors: [error.message],
    });
  }
};
