import Category from "../models/Category.js";
import Product from "../models/Product.js";

import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

import { generateSlug } from "../utils/generateSlug.js";

/* =========================================================
   CREATE CATEGORY
========================================================= */

export const createCategory = async (req, res) => {
  try {
    const { name, description, sortOrder, parentCategory } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    /* -----------------------------
       Parent validation
    ----------------------------- */

    let parent = null;

    if (parentCategory) {
      parent = await Category.findById(parentCategory);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }

      if (!parent.isActive) {
        return res.status(400).json({
          success: false,
          message: "Parent category is inactive",
        });
      }

      // Only one level nesting allowed
      if (parent.parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Subcategories cannot have another parent category",
        });
      }
    }

    /* -----------------------------
       Slug
    ----------------------------- */

    const slug = generateSlug(name.trim());

    const existingCategory = await Category.findOne({ slug });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    /* -----------------------------
       Image upload
    ----------------------------- */

    let image = "";

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        "cbnk/categories",
      );

      image = uploadedImage.secure_url;
    }

    /* -----------------------------
       Create
    ----------------------------- */

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
      image,
      sortOrder: Number(sortOrder) || 0,
      parentCategory: parent?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

/* =========================================================
   GET CATEGORIES
   Public categories = active only
========================================================= */

export const getCategories = async (req, res) => {
  try {
    const { parent = "root" } = req.query;

    const filter = {
      isActive: true,
    };

    if (parent === "root") {
      filter.parentCategory = null;
    } else {
      filter.parentCategory = parent;
    }

    const categories = await Category.find(filter)
      .populate("parentCategory", "name slug")
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

/* =========================================================
   GET CATEGORY BY SLUG
========================================================= */

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    }).populate("parentCategory", "name slug");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category by slug error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

/* =========================================================
   GET ALL CATEGORIES - ADMIN
========================================================= */

export const getAdminCategories = async (req, res) => {
  try {
    const {
      includeInactive = "true",
      parent,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (includeInactive !== "true") {
      filter.isActive = true;
    }

    if (parent === "root") {
      filter.parentCategory = null;
    } else if (parent) {
      filter.parentCategory = parent;
    }

    if (search?.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          slug: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * currentLimit;

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .populate("parentCategory", "name slug")
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(currentLimit)
        .lean(),

      Category.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
        hasNext: currentPage < Math.ceil(total / currentLimit),
        hasPrev: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get admin categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

/* =========================================================
   UPDATE CATEGORY
========================================================= */

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const { name, description, sortOrder, parentCategory } = req.body;

    /* -----------------------------
       Name / slug
    ----------------------------- */

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      if (trimmedName !== category.name) {
        const newSlug = generateSlug(trimmedName);

        const existingCategory = await Category.findOne({
          slug: newSlug,
          _id: { $ne: id },
        });

        if (existingCategory) {
          return res.status(409).json({
            success: false,
            message: "Category with this name already exists",
          });
        }

        category.name = trimmedName;
        category.slug = newSlug;
      }
    }

    /* -----------------------------
       Description
    ----------------------------- */

    if (description !== undefined) {
      category.description = description.trim();
    }

    /* -----------------------------
       Sort order
    ----------------------------- */

    if (sortOrder !== undefined) {
      const parsedSortOrder = Number(sortOrder);

      if (Number.isNaN(parsedSortOrder)) {
        return res.status(400).json({
          success: false,
          message: "Sort order must be a valid number",
        });
      }

      category.sortOrder = parsedSortOrder;
    }

    /* -----------------------------
       Parent category
    ----------------------------- */

    if (parentCategory !== undefined) {
      // Empty value means root category
      if (!parentCategory) {
        category.parentCategory = null;
      } else {
        // Prevent itself as parent
        if (parentCategory.toString() === id.toString()) {
          return res.status(400).json({
            success: false,
            message: "A category cannot be its own parent",
          });
        }

        const parent = await Category.findById(parentCategory);

        if (!parent) {
          return res.status(404).json({
            success: false,
            message: "Parent category not found",
          });
        }

        if (!parent.isActive) {
          return res.status(400).json({
            success: false,
            message: "Parent category is inactive",
          });
        }

        // Only one level nesting allowed
        if (parent.parentCategory) {
          return res.status(400).json({
            success: false,
            message: "Subcategories cannot have another parent category",
          });
        }

        category.parentCategory = parent._id;
      }
    }

    /* -----------------------------
       Image
    ----------------------------- */

    let oldImage = "";

    if (req.file) {
      oldImage = category.image;

      const uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        "cbnk/categories",
      );

      category.image = uploadedImage.secure_url;
    }

    await category.save();

    /*
      Delete old image only AFTER successful DB save.
      Since the current schema stores only URL, publicId
      cannot be recovered reliably here.
    */

    void oldImage;

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

/* =========================================================
   TOGGLE CATEGORY STATUS
========================================================= */

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const newStatus = !category.isActive;

    /* -----------------------------
       Deactivating parent
    ----------------------------- */

    if (!newStatus) {
      const activeChildren = await Category.countDocuments({
        parentCategory: category._id,
        isActive: true,
      });

      if (activeChildren > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Deactivate or move all active subcategories before deactivating this category",
        });
      }
    }

    category.isActive = newStatus;

    await category.save();

    return res.status(200).json({
      success: true,
      message: `Category ${
        newStatus ? "activated" : "deactivated"
      } successfully`,
      data: category,
    });
  } catch (error) {
    console.error("Toggle category status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category status",
    });
  }
};

/* =========================================================
   DELETE CATEGORY
   Soft delete = deactivate
========================================================= */

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /* -----------------------------
       Check active children
    ----------------------------- */

    const activeChildren = await Category.countDocuments({
      parentCategory: category._id,
      isActive: true,
    });

    if (activeChildren > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category while active subcategories exist",
      });
    }

    /* -----------------------------
       Check products
    ----------------------------- */

    const productCount = await Product.countDocuments({
      category: category._id,
      isDeleted: false,
    });

    const subCategoryProductCount = await Product.countDocuments({
      subCategory: category._id,
      isDeleted: false,
    });

    if (productCount > 0 || subCategoryProductCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category because products are still assigned to it",
      });
    }

    /*
      We intentionally soft-delete/deactivate instead of
      physically removing the document because products,
      orders and coupons may reference this category.
    */

    category.isActive = false;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};
