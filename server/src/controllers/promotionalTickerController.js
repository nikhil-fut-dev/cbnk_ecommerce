import mongoose from "mongoose";

import {
  getPublishedPromotionalTickers,
  getAllPromotionalTickers,
  getPromotionalTickerById,
  createPromotionalTicker,
  updatePromotionalTicker,
  deletePromotionalTicker,
  togglePromotionalTickerStatus,
} from "../services/promotionalTickerService.js";

// =====================================================
// OBJECT ID VALIDATION
// =====================================================
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// PUBLIC
// GET PUBLISHED TICKERS
// =====================================================
export const getPromotionalTickers = async (req, res) => {
  try {
    const tickers = await getPublishedPromotionalTickers();

    return res.status(200).json({
      success: true,
      message: "Promotional tickers fetched successfully",
      data: tickers,
    });
  } catch (error) {
    console.error("Get promotional tickers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch promotional tickers",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// GET ALL TICKERS
// =====================================================
export const getAdminPromotionalTickers = async (req, res) => {
  try {
    const tickers = await getAllPromotionalTickers();

    return res.status(200).json({
      success: true,
      message: "Promotional tickers fetched successfully",
      data: tickers,
    });
  } catch (error) {
    console.error("Get admin promotional tickers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch promotional tickers",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// GET SINGLE TICKER
// =====================================================
export const getAdminPromotionalTickerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid promotional ticker ID",
        errors: [],
      });
    }

    const ticker = await getPromotionalTickerById(id);

    if (!ticker) {
      return res.status(404).json({
        success: false,
        message: "Promotional ticker not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Promotional ticker fetched successfully",
      data: ticker,
    });
  } catch (error) {
    console.error("Get admin promotional ticker error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch promotional ticker",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// CREATE TICKER
// =====================================================
export const createAdminPromotionalTicker = async (req, res) => {
  try {
    const { text, couponCode, isActive, sortOrder, status, startAt, endAt } =
      req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ticker text is required",
        errors: [],
      });
    }

    const ticker = await createPromotionalTicker({
      text,
      couponCode,
      isActive,
      sortOrder,
      status,
      startAt,
      endAt,
    });

    return res.status(201).json({
      success: true,
      message: "Promotional ticker created successfully",
      data: ticker,
    });
  } catch (error) {
    console.error("Create promotional ticker error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create promotional ticker",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// UPDATE TICKER
// =====================================================
export const updateAdminPromotionalTicker = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid promotional ticker ID",
        errors: [],
      });
    }

    const allowedFields = [
      "text",
      "couponCode",
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

    const ticker = await updatePromotionalTicker(id, updateData);

    if (!ticker) {
      return res.status(404).json({
        success: false,
        message: "Promotional ticker not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Promotional ticker updated successfully",
      data: ticker,
    });
  } catch (error) {
    console.error("Update promotional ticker error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update promotional ticker",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// DELETE TICKER
// =====================================================
export const deleteAdminPromotionalTicker = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid promotional ticker ID",
        errors: [],
      });
    }

    const ticker = await deletePromotionalTicker(id);

    if (!ticker) {
      return res.status(404).json({
        success: false,
        message: "Promotional ticker not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Promotional ticker deleted successfully",
      data: ticker,
    });
  } catch (error) {
    console.error("Delete promotional ticker error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete promotional ticker",
      errors: [error.message],
    });
  }
};

// =====================================================
// ADMIN
// TOGGLE STATUS
// =====================================================
export const toggleAdminPromotionalTickerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid promotional ticker ID",
        errors: [],
      });
    }

    const ticker = await togglePromotionalTickerStatus(id);

    if (!ticker) {
      return res.status(404).json({
        success: false,
        message: "Promotional ticker not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Promotional ticker status updated successfully",
      data: ticker,
    });
  } catch (error) {
    console.error("Toggle promotional ticker status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update promotional ticker status",
      errors: [error.message],
    });
  }
};
