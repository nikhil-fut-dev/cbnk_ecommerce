import mongoose from "mongoose";

const inventoryVariantSchema = new mongoose.Schema(
  {
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    SKU: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

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

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    reservedStock: {
      type: Number,
      min: 0,
      default: 0,
    },

    soldStock: {
      type: Number,
      min: 0,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },
  },
  { _id: false },
);

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },

    totalStock: {
      type: Number,
      min: 0,
      default: 0,
    },

    reservedStock: {
      type: Number,
      min: 0,
      default: 0,
    },

    soldStock: {
      type: Number,
      min: 0,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },

    variants: {
      type: [inventoryVariantSchema],
      default: [],
    },

    lastRestockedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

inventorySchema.index({
  "variants.SKU": 1,
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
