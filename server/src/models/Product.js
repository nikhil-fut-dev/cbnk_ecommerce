import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    alt: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const productVariantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      trim: true,
      default: "",
    },

    color: {
      type: String,
      trim: true,
      default: "",
    },

    colorCode: {
      type: String,
      trim: true,
      default: "",
    },

    SKU: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    price: {
      type: Number,
      min: 0,
      default: null,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    image: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    brand: {
      type: String,
      trim: true,
      default: "CBNK",
    },

    gender: {
      type: String,
      enum: ["MEN", "WOMEN", "UNISEX", "KIDS"],
      default: "WOMEN",
      index: true,
    },

    ageGroup: {
      type: String,
      enum: ["ADULT", "TEEN", "KIDS"],
      default: "ADULT",
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    compareAtPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    SKU: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    images: {
      type: [productImageSchema],
      default: [],
    },

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    variants: {
      type: [productVariantSchema],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    material: {
      type: String,
      trim: true,
      default: "",
    },

    specifications: {
      type: Map,
      of: String,
      default: {},
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isNewArrival: {
      type: Boolean,
      default: true,
      index: true,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// --------------------------------
// Compound Indexes
// --------------------------------

productSchema.index({
  category: 1,
  isActive: 1,
});

productSchema.index({
  subCategory: 1,
  isActive: 1,
});

productSchema.index({
  isFeatured: 1,
  isActive: 1,
});

productSchema.index({
  isNewArrival: 1,
  isActive: 1,
});

productSchema.index({
  isBestSeller: 1,
  isActive: 1,
});

productSchema.index({
  createdAt: -1,
});

// --------------------------------
// Product Model
// --------------------------------

const Product = mongoose.model("Product", productSchema);

export default Product;
