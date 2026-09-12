import Product from "../models/Product.js";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

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
      isNew,
      isBestSeller,
    } = req.body;

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

      isNew: isNew === undefined ? true : isNew === true || isNew === "true",

      isBestSeller: isBestSeller === true || isBestSeller === "true",
    });

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
    const { category, gender, featured, newArrivals, bestSeller, search } =
      req.query;

    const filter = {
      isActive: true,
    };

    if (category) {
      filter.category = category;
    }

    if (gender) {
      filter.gender = gender.toUpperCase();
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    if (newArrivals === "true") {
      filter.isNew = true;
    }

    if (bestSeller === "true") {
      filter.isBestSeller = true;
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
      ];
    }

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
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
