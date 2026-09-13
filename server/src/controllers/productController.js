import Product from "../models/Product.js";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";
import { validateProductInput } from "../validators/productValidator.js";
import { createOrSyncInventory } from "../services/inventoryService.js";

const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      subCategory,
      brand,
      gender,
      ageGroup,
      price,
      compareAtPrice,
      discount,
      SKU,
      stock,
      sizes,
      colors,
      variants,
      tags,
      material,
      specifications,
      isFeatured,
      isNewArrival,
      isBestSeller,
    } = req.body;

    const validation = validateProductInput({
      name,
      description,
      category,
      price,
      SKU,
      gender,
      ageGroup,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        errors: validation.errors,
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product description is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid product price is required",
      });
    }

    if (!SKU?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product SKU is required",
      });
    }

    const categoryExists = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (subCategory) {
      const subCategoryExists = await Category.findOne({
        _id: subCategory,
        isActive: true,
      });

      if (!subCategoryExists) {
        return res.status(404).json({
          success: false,
          message: "Subcategory not found",
        });
      }
    }

    const slug = createSlug(name);

    const existingProduct = await Product.findOne({
      $or: [{ slug }, { SKU: SKU.trim().toUpperCase() }],
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this name or SKU already exists",
      });
    }

    // Parse array fields coming from multipart/form-data
    const parseArray = (value) => {
      if (!value) return [];

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

    const parsedSizes = parseArray(sizes);
    const parsedColors = parseArray(colors);
    const parsedVariants = parseArray(variants);
    const parsedTags = parseArray(tags);

    let parsedSpecifications = {};

    if (specifications) {
      try {
        parsedSpecifications =
          typeof specifications === "string"
            ? JSON.parse(specifications)
            : specifications;
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid specifications format",
        });
      }
    }

    // Upload images to Cloudinary
    const uploadedImages = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer, "cbnk/products");

        uploadedImages.push({
          url: uploaded.url,
          publicId: uploaded.publicId,
          alt: name.trim(),
        });
      }
    }

    const product = await Product.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      shortDescription: shortDescription?.trim() || "",
      category,
      subCategory: subCategory || null,
      brand: brand?.trim() || "CBNK",
      gender: gender || "WOMEN",
      ageGroup: ageGroup || "ADULT",

      price: Number(price),

      compareAtPrice:
        compareAtPrice !== undefined && compareAtPrice !== ""
          ? Number(compareAtPrice)
          : null,

      discount: Number(discount) || 0,

      SKU: SKU.trim().toUpperCase(),

      stock: Number(stock) || 0,

      images: uploadedImages,

      sizes: parsedSizes,
      colors: parsedColors,
      variants: parsedVariants,
      tags: parsedTags,

      material: material?.trim() || "",

      specifications: parsedSpecifications,

      isFeatured: isFeatured === true || isFeatured === "true",

      isNewArrival: isNewArrival === undefined ? true : isNewArrival === true || isNewArrival === "true",

      isBestSeller: isBestSeller === true || isBestSeller === "true",
    });

    await createOrSyncInventory(product._id);

    await product.populate("category", "name slug");

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      subCategory,
      gender,
      size,
      color,
      minPrice,
      maxPrice,
      inStock,
      featured,
      newArrivals,
      bestSeller,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {
      isActive: true,
      isDeleted: false,
    };

    // --------------------------------
    // Search
    // --------------------------------

    if (search?.trim()) {
      filter.$or = [
        {
          name: {
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
        {
          tags: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          brand: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          SKU: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // --------------------------------
    // Category
    // --------------------------------

    if (category) {
      filter.category = category;
    }

    // --------------------------------
    // Subcategory
    // --------------------------------

    if (subCategory) {
      filter.subCategory = subCategory;
    }

    // --------------------------------
    // Gender
    // --------------------------------

    if (gender) {
      const genders = gender
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean);

      if (genders.length === 1) {
        filter.gender = genders[0];
      } else if (genders.length > 1) {
        filter.gender = {
          $in: genders,
        };
      }
    }

    // --------------------------------
    // Size
    // --------------------------------

    if (size) {
      const sizes = size
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      filter.sizes = {
        $in: sizes,
      };
    }

    // --------------------------------
    // Color
    // --------------------------------

    if (color) {
      const colors = color
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      filter.colors = {
        $in: colors,
      };
    }

    // --------------------------------
    // Price Range
    // --------------------------------

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined && minPrice !== "") {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined && maxPrice !== "") {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // --------------------------------
    // Stock
    // --------------------------------

    if (inStock === "true") {
      filter.stock = {
        $gt: 0,
      };
    }

    // --------------------------------
    // Product flags
    // --------------------------------

    if (featured === "true") {
      filter.isFeatured = true;
    }

    if (newArrivals === "true") {
      filter.isNewArrival = true;
    }

    if (bestSeller === "true") {
      filter.isBestSeller = true;
    }

    // --------------------------------
    // Pagination
    // --------------------------------

    const currentPage = Math.max(Number(page) || 1, 1);

    const perPage = Math.min(Math.max(Number(limit) || 12, 1), 100);

    const skip = (currentPage - 1) * perPage;

    // --------------------------------
    // Sorting
    // --------------------------------

    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "price-low":
        sortOption = {
          price: 1,
        };
        break;

      case "price-high":
        sortOption = {
          price: -1,
        };
        break;

      case "name-asc":
        sortOption = {
          name: 1,
        };
        break;

      case "name-desc":
        sortOption = {
          name: -1,
        };
        break;

      case "rating":
        sortOption = {
          rating: -1,
          reviewCount: -1,
        };
        break;

      case "newest":
      default:
        sortOption = {
          createdAt: -1,
        };
        break;
    }

    // --------------------------------
    // Database queries
    // --------------------------------

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .populate("subCategory", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(perPage)
        .lean(),

      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / perPage);

    return res.status(200).json({
      success: true,

      products,

      pagination: {
        page: currentPage,
        limit: perPage,
        totalProducts,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// GET PRODUCT BY SLUG
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      slug,
      isActive: true,
      isDeleted: false,
    })
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      shortDescription,
      category,
      subCategory,
      brand,
      gender,
      ageGroup,
      price,
      compareAtPrice,
      discount,
      SKU,
      stock,
      sizes,
      colors,
      variants,
      tags,
      material,
      specifications,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isActive,
      keepImages,
    } = req.body;

    const validation = validateProductInput({
      name,
      description,
      category,
      price,
      SKU,
      gender,
      ageGroup,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        errors: validation.errors,
      });
    }

    // --------------------------------
    // Validate category
    // --------------------------------

    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        isActive: true,
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    if (subCategory) {
      const subCategoryExists = await Category.findOne({
        _id: subCategory,
        isActive: true,
      });

      if (!subCategoryExists) {
        return res.status(404).json({
          success: false,
          message: "Subcategory not found",
        });
      }
    }

    // --------------------------------
    // Validate SKU
    // --------------------------------

    if (SKU) {
      const normalizedSKU = SKU.trim().toUpperCase();

      const existingSKU = await Product.findOne({
        SKU: normalizedSKU,
        _id: { $ne: id },
      });

      if (existingSKU) {
        return res.status(409).json({
          success: false,
          message: "Another product already uses this SKU",
        });
      }
    }

    // --------------------------------
    // Update basic fields
    // --------------------------------

    if (name !== undefined) {
      product.name = name.trim();
      product.slug = createSlug(name);
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (shortDescription !== undefined) {
      product.shortDescription = shortDescription.trim();
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (subCategory !== undefined) {
      product.subCategory = subCategory || null;
    }

    if (brand !== undefined) {
      product.brand = brand.trim();
    }

    if (gender !== undefined) {
      product.gender = gender;
    }

    if (ageGroup !== undefined) {
      product.ageGroup = ageGroup;
    }

    if (price !== undefined) {
      product.price = Number(price);
    }

    if (compareAtPrice !== undefined) {
      product.compareAtPrice =
        compareAtPrice === "" || compareAtPrice === null
          ? null
          : Number(compareAtPrice);
    }

    if (discount !== undefined) {
      product.discount = Number(discount);
    }

    if (SKU !== undefined) {
      product.SKU = SKU.trim().toUpperCase();
    }

    if (stock !== undefined) {
      product.stock = Number(stock);
    }

    // --------------------------------
    // Parse arrays
    // --------------------------------

    const parseArray = (value) => {
      if (value === undefined || value === null || value === "") {
        return null;
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

    const parsedSizes = parseArray(sizes);
    const parsedColors = parseArray(colors);
    const parsedVariants = parseArray(variants);
    const variantSKUs = parsedVariants
      .map((variant) => variant?.SKU?.trim().toUpperCase())
      .filter(Boolean);

    const uniqueVariantSKUs = new Set(variantSKUs);

    if (variantSKUs.length !== uniqueVariantSKUs.size) {
      return res.status(400).json({
        success: false,
        message: "Variant SKUs must be unique",
      });
    }
    const parsedTags = parseArray(tags);

    if (parsedSizes !== null) {
      product.sizes = parsedSizes;
    }

    if (parsedColors !== null) {
      product.colors = parsedColors;
    }

    if (parsedVariants !== null) {
      product.variants = parsedVariants;
    }

    if (parsedTags !== null) {
      product.tags = parsedTags;
    }

    // --------------------------------
    // Specifications
    // --------------------------------

    if (specifications !== undefined) {
      try {
        product.specifications =
          typeof specifications === "string"
            ? JSON.parse(specifications)
            : specifications;
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid specifications format",
        });
      }
    }

    if (material !== undefined) {
      product.material = material.trim();
    }

    // --------------------------------
    // Product flags
    // --------------------------------

    if (isFeatured !== undefined) {
      product.isFeatured = isFeatured === true || isFeatured === "true";
    }

    if (isNewArrival !== undefined) {
      product.isNewArrival = isNewArrival === true || isNewArrival === "true";
    }

    if (isBestSeller !== undefined) {
      product.isBestSeller = isBestSeller === true || isBestSeller === "true";
    }

    if (isActive !== undefined) {
      product.isActive = isActive === true || isActive === "true";
    }

    // --------------------------------
    // Existing images to keep
    // --------------------------------

    let imagesToKeep = product.images || [];

    if (keepImages !== undefined) {
      try {
        imagesToKeep =
          typeof keepImages === "string" ? JSON.parse(keepImages) : keepImages;

        if (!Array.isArray(imagesToKeep)) {
          imagesToKeep = [];
        }
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid keepImages format",
        });
      }
    }

    // --------------------------------
    // Delete removed Cloudinary images
    // --------------------------------

    const oldImages = product.images || [];

    const keptPublicIds = new Set(
      imagesToKeep.map((image) => image.publicId).filter(Boolean),
    );

    for (const oldImage of oldImages) {
      if (oldImage.publicId && !keptPublicIds.has(oldImage.publicId)) {
        await deleteFromCloudinary(oldImage.publicId);
      }
    }

    // --------------------------------
    // Upload new images
    // --------------------------------

    const newImages = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.buffer, "cbnk/products");

        newImages.push({
          url: uploaded.url,
          publicId: uploaded.publicId,
          alt: product.name,
        });
      }
    }

    product.images = [...imagesToKeep, ...newImages];

    // --------------------------------
    // Save
    // --------------------------------

    await product.save();

    await createOrSyncInventory(product._id);

    await product.populate("category", "name slug");
    await product.populate("subCategory", "name slug");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete all product images from Cloudinary
    if (product.images?.length) {
      for (const image of product.images) {
        if (image.publicId) {
          await deleteFromCloudinary(image.publicId);
        }
      }
    }

    product.isActive = false;
    product.isDeleted = true;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product archived successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};
