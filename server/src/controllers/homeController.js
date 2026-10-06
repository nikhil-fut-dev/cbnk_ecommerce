import mongoose from "mongoose";

import {
  getPublishedHomeSections,
  getAllHomeSections,
  getHomeSectionById,
  createHomeSection,
  updateHomeSection,
  deleteHomeSection,
  toggleHomeSectionStatus,
  getPublishedHomeData,
} from "../services/homeService.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ======================================================
// CUSTOMER
// GET /api/v1/home/sections
// ======================================================

export const getHomeSections = async (req, res) => {
  try {
    const sections = await getPublishedHomeSections();

    return res.status(200).json({
      success: true,
      message: "Home sections fetched successfully",
      data: sections,
    });
  } catch (error) {
    console.error("Get home sections error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch home sections",
      errors: [error.message],
    });
  }
};

// ======================================================
// ADMIN
// GET /api/v1/admin/home/sections
// ======================================================

export const getAdminHomeSections = async (req, res) => {
  try {
    const sections = await getAllHomeSections();

    return res.status(200).json({
      success: true,
      message: "Home sections fetched successfully",
      data: sections,
    });
  } catch (error) {
    console.error("Get admin home sections error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch home sections",
      errors: [error.message],
    });
  }
};

// ======================================================
// ADMIN
// GET SINGLE SECTION
// ======================================================

export const getAdminHomeSectionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid home section ID",
        errors: [],
      });
    }

    const section = await getHomeSectionById(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Home section not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Home section fetched successfully",
      data: section,
    });
  } catch (error) {
    console.error("Get admin home section error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch home section",
      errors: [error.message],
    });
  }
};

// ======================================================
// ADMIN
// CREATE SECTION
// ======================================================

export const createAdminHomeSection = async (req, res) => {
  try {
    const {
      key,
      title,
      description,
      isActive,
      sortOrder,
      status,
      startAt,
      endAt,
    } = req.body;

    if (!key || !title) {
      return res.status(400).json({
        success: false,
        message: "key and title are required",
        errors: [],
      });
    }

    const section = await createHomeSection({
      key,
      title,
      description,
      isActive,
      sortOrder,
      status,
      startAt,
      endAt,
    });

    return res.status(201).json({
      success: true,
      message: "Home section created successfully",
      data: section,
    });
  } catch (error) {
    console.error("Create admin home section error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Home section key already exists",
        errors: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create home section",
      errors: [error.message],
    });
  }
};

// ======================================================
// ADMIN
// UPDATE SECTION
// ======================================================

export const updateAdminHomeSection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid home section ID",
        errors: [],
      });
    }

    const allowedFields = [
      "title",
      "description",
      "isActive",
      "sortOrder",
      "status",
      "startAt",
      "endAt",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const section = await updateHomeSection(id, updateData);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Home section not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Home section updated successfully",
      data: section,
    });
  } catch (error) {
    console.error("Update admin home section error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update home section",
      errors: [error.message],
    });
  }
};

// ======================================================
// ADMIN
// DELETE SECTION
// ======================================================

export const deleteAdminHomeSection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid home section ID",
        errors: [],
      });
    }

    const section = await deleteHomeSection(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Home section not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Home section deleted successfully",
      data: section,
    });
  } catch (error) {
    console.error("Delete admin home section error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete home section",
      errors: [error.message],
    });
  }
};

// ======================================================
// ADMIN
// TOGGLE STATUS
// ======================================================

export const toggleAdminHomeSectionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid home section ID",
        errors: [],
      });
    }

    const section = await toggleHomeSectionStatus(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Home section not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Home section status updated successfully",
      data: section,
    });
  } catch (error) {
    console.error("Toggle home section status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update home section status",
      errors: [error.message],
    });
  }
};

// ======================================================
// CUSTOMER
// GET /api/v1/home
// ======================================================

export const getHomeData = async (req, res) => {
  try {
    const home = await getPublishedHomeData();

    return res.status(200).json({
      success: true,
      message: "Home data fetched successfully",
      home,
    });
  } catch (error) {
    console.error("Get home data error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch home data",
      errors: [error.message],
    });
  }
};
