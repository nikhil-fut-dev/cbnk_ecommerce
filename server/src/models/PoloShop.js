import mongoose from "mongoose";

const poloShopSchema = new mongoose.Schema(
  {
    smallText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    priceText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    desktopImage: {
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

    mobileImage: {
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

    cta: {
      text: {
        type: String,
        default: "",
        trim: true,
        maxlength: 50,
      },

      link: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      openInNewTab: {
        type: Boolean,
        default: false,
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "INACTIVE"],
      default: "DRAFT",
      index: true,
    },

    startAt: {
      type: Date,
      default: null,
    },

    endAt: {
      type: Date,
      default: null,
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

poloShopSchema.index({
  category: 1,
  product: 1,
  isActive: 1,
  status: 1,
  isDeleted: 1,
  sortOrder: 1,
});

const PoloShop = mongoose.model("PoloShop", poloShopSchema);

export default PoloShop;
