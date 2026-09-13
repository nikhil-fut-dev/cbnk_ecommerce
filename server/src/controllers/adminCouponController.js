import Coupon from "../models/Coupon.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

// CREATE COUPON
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minimumOrderValue,
      maximumOrderValue,
      usageLimit,
      perUserLimit,
      startDate,
      expiryDate,
      applicableCategories,
      applicableProducts,
      isActive,
    } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    if (!["PERCENTAGE", "FIXED"].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    const value = Number(discountValue);

    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0",
      });
    }

    if (discountType === "PERCENTAGE" && value > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    if (!startDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and expiry date are required",
      });
    }

    const start = new Date(startDate);
    const expiry = new Date(expiryDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(expiry.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon dates",
      });
    }

    if (expiry <= start) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be after start date",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const existingCoupon = await Coupon.findOne({
      code: normalizedCode,
    });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Coupon with this code already exists",
      });
    }

    const parseArray = (value) => {
      if (value === undefined || value === null || value === "") {
        return [];
      }

      if (Array.isArray(value)) {
        return value;
      }

      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    };

    const categories = parseArray(applicableCategories);
    const products = parseArray(applicableProducts);

    if (categories.length) {
      const categoryCount = await Category.countDocuments({
        _id: { $in: categories },
      });

      if (categoryCount !== categories.length) {
        return res.status(400).json({
          success: false,
          message: "One or more applicable categories are invalid",
        });
      }
    }

    if (products.length) {
      const productCount = await Product.countDocuments({
        _id: { $in: products },
      });

      if (productCount !== products.length) {
        return res.status(400).json({
          success: false,
          message: "One or more applicable products are invalid",
        });
      }
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      description: description?.trim() || "",

      discountType,
      discountValue: value,

      maxDiscount:
        maxDiscount !== undefined && maxDiscount !== ""
          ? Number(maxDiscount)
          : null,

      minimumOrderValue:
        minimumOrderValue !== undefined && minimumOrderValue !== ""
          ? Number(minimumOrderValue)
          : 0,

      maximumOrderValue:
        maximumOrderValue !== undefined && maximumOrderValue !== ""
          ? Number(maximumOrderValue)
          : null,

      usageLimit:
        usageLimit !== undefined && usageLimit !== ""
          ? Number(usageLimit)
          : null,

      perUserLimit:
        perUserLimit !== undefined && perUserLimit !== ""
          ? Number(perUserLimit)
          : 1,

      startDate: start,
      expiryDate: expiry,

      applicableCategories: categories,
      applicableProducts: products,

      isActive:
        isActive === undefined
          ? true
          : isActive === true || isActive === "true",
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create admin coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

// GET ALL COUPONS
export const getAdminCoupons = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (search?.trim()) {
      filter.$or = [
        {
          code: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const currentPage = Math.max(Number(page) || 1, 1);

    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * perPage;

    const [coupons, totalCoupons] = await Promise.all([
      Coupon.find(filter)
        .populate("applicableCategories", "name slug")
        .populate("applicableProducts", "name slug SKU")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Coupon.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCoupons / perPage);

    return res.status(200).json({
      success: true,

      coupons,

      pagination: {
        page: currentPage,
        limit: perPage,
        totalCoupons,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get admin coupons error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

// GET SINGLE COUPON
export const getAdminCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("applicableCategories", "name slug")
      .populate("applicableProducts", "name slug SKU");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error("Get admin coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
    });
  }
};

// UPDATE COUPON
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minimumOrderValue,
      maximumOrderValue,
      usageLimit,
      perUserLimit,
      startDate,
      expiryDate,
      applicableCategories,
      applicableProducts,
      isActive,
    } = req.body;

    if (code !== undefined) {
      const normalizedCode = code.trim().toUpperCase();

      if (!normalizedCode) {
        return res.status(400).json({
          success: false,
          message: "Coupon code cannot be empty",
        });
      }

      const duplicate = await Coupon.findOne({
        code: normalizedCode,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another coupon already uses this code",
        });
      }

      coupon.code = normalizedCode;
    }

    if (description !== undefined) {
      coupon.description = description.trim();
    }

    if (discountType !== undefined) {
      if (!["PERCENTAGE", "FIXED"].includes(discountType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type",
        });
      }

      coupon.discountType = discountType;
    }

    if (discountValue !== undefined) {
      const value = Number(discountValue);

      if (!Number.isFinite(value) || value <= 0) {
        return res.status(400).json({
          success: false,
          message: "Discount value must be greater than 0",
        });
      }

      if (coupon.discountType === "PERCENTAGE" && value > 100) {
        return res.status(400).json({
          success: false,
          message: "Percentage discount cannot exceed 100%",
        });
      }

      coupon.discountValue = value;
    }

    if (maxDiscount !== undefined) {
      coupon.maxDiscount =
        maxDiscount === "" || maxDiscount === null ? null : Number(maxDiscount);
    }

    if (minimumOrderValue !== undefined) {
      coupon.minimumOrderValue =
        minimumOrderValue === "" ? 0 : Number(minimumOrderValue);
    }

    if (maximumOrderValue !== undefined) {
      coupon.maximumOrderValue =
        maximumOrderValue === "" || maximumOrderValue === null
          ? null
          : Number(maximumOrderValue);
    }

    if (usageLimit !== undefined) {
      coupon.usageLimit =
        usageLimit === "" || usageLimit === null ? null : Number(usageLimit);
    }

    if (perUserLimit !== undefined) {
      coupon.perUserLimit =
        perUserLimit === "" || perUserLimit === null ? 1 : Number(perUserLimit);
    }

    if (startDate !== undefined) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date",
        });
      }

      coupon.startDate = start;
    }

    if (expiryDate !== undefined) {
      const expiry = new Date(expiryDate);

      if (Number.isNaN(expiry.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date",
        });
      }

      coupon.expiryDate = expiry;
    }

    if (coupon.expiryDate <= coupon.startDate) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be after start date",
      });
    }

    const parseArray = (value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (value === undefined || value === null || value === "") {
        return [];
      }

      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    };

    if (applicableCategories !== undefined) {
      const categories = parseArray(applicableCategories);

      const categoryCount = await Category.countDocuments({
        _id: { $in: categories },
      });

      if (categoryCount !== categories.length) {
        return res.status(400).json({
          success: false,
          message: "One or more applicable categories are invalid",
        });
      }

      coupon.applicableCategories = categories;
    }

    if (applicableProducts !== undefined) {
      const products = parseArray(applicableProducts);

      const productCount = await Product.countDocuments({
        _id: { $in: products },
      });

      if (productCount !== products.length) {
        return res.status(400).json({
          success: false,
          message: "One or more applicable products are invalid",
        });
      }

      coupon.applicableProducts = products;
    }

    if (isActive !== undefined) {
      coupon.isActive = isActive === true || isActive === "true";
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Update admin coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

// TOGGLE COUPON STATUS
export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.isActive = !coupon.isActive;

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: coupon.isActive
        ? "Coupon activated successfully"
        : "Coupon deactivated successfully",

      coupon: {
        _id: coupon._id,
        code: coupon.code,
        isActive: coupon.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle coupon status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon status",
    });
  }
};

// DELETE COUPON
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Do not physically delete a coupon that has already been used.
    if (coupon.usedCount > 0) {
      coupon.isActive = false;

      await coupon.save();

      return res.status(200).json({
        success: true,
        message: "Coupon has usage history, so it was deactivated instead",
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};
