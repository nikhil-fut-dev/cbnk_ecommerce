import Product from "../models/Product.js";
import Category from "../models/Category.js";

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
      images,
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

    if (price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Product price is required",
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
        compareAtPrice !== undefined && compareAtPrice !== null
          ? Number(compareAtPrice)
          : null,
      discount: Number(discount) || 0,
      SKU: SKU.trim().toUpperCase(),
      stock: Number(stock) || 0,
      images: Array.isArray(images) ? images : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      variants: Array.isArray(variants) ? variants : [],
      tags: Array.isArray(tags) ? tags : [],
      material: material?.trim() || "",
      specifications: specifications || {},
      isFeatured: Boolean(isFeatured),
      isNew: isNew !== undefined ? Boolean(isNew) : true,
      isBestSeller: Boolean(isBestSeller),
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
