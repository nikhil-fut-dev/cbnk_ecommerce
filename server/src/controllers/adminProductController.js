import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

// GET ALL PRODUCTS FOR ADMIN
export const getAdminProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      isDeleted,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const filter = {};

    // Search
    if (search?.trim()) {
      filter.$or = [
        {
          name: {
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
        {
          brand: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // Category
    if (category) {
      filter.category = category;
    }

    // Active / inactive / deleted
    if (status === "active") {
      filter.isActive = true;
      filter.isDeleted = false;
    }

    if (status === "inactive") {
      filter.isActive = false;
      filter.isDeleted = false;
    }

    if (isDeleted === "true") {
      filter.isDeleted = true;
    }

    if (isDeleted === "false") {
      filter.isDeleted = false;
    }

    const currentPage = Math.max(Number(page) || 1, 1);

    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (currentPage - 1) * perPage;

    // Sorting
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

      case "newest":
      default:
        sortOption = {
          createdAt: -1,
        };
        break;
    }

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

    // Get inventory for these products
    const productIds = products.map((product) => product._id);

    const inventories = await Inventory.find({
      product: {
        $in: productIds,
      },
    })
      .select(
        "product totalStock reservedStock soldStock lowStockThreshold variants lastRestockedAt",
      )
      .lean();

    const inventoryMap = new Map(
      inventories.map((inventory) => [inventory.product.toString(), inventory]),
    );

    const productsWithInventory = products.map((product) => {
      const inventory = inventoryMap.get(product._id.toString());

      const availableStock = inventory
        ? Math.max(inventory.totalStock - inventory.reservedStock, 0)
        : 0;

      return {
        ...product,

        availableStock,

        inventory: inventory || null,
      };
    });

    const totalPages = Math.ceil(totalProducts / perPage);

    return res.status(200).json({
      success: true,

      products: productsWithInventory,

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
    console.error("Get admin products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin products",
    });
  }
};

// GET SINGLE PRODUCT FOR ADMIN
export const getAdminProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const inventory = await Inventory.findOne({
      product: product._id,
    }).lean();

    const availableStock = inventory
      ? Math.max(inventory.totalStock - inventory.reservedStock, 0)
      : 0;

    return res.status(200).json({
      success: true,

      product: {
        ...product,
        availableStock,
        inventory: inventory || null,
      },
    });
  } catch (error) {
    console.error("Get admin product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// TOGGLE PRODUCT STATUS
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Deleted product cannot be activated",
      });
    }

    product.isActive = !product.isActive;

    await product.save();

    return res.status(200).json({
      success: true,
      message: product.isActive
        ? "Product activated successfully"
        : "Product deactivated successfully",

      product: {
        _id: product._id,
        isActive: product.isActive,
        isDeleted: product.isDeleted,
      },
    });
  } catch (error) {
    console.error("Toggle product status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product status",
    });
  }
};
