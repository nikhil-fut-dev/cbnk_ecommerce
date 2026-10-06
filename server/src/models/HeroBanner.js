import mongoose from "mongoose";

const heroBannerSchema = new mongoose.Schema(
  {
    smallText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
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

    ctaText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    ctaLink: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
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

heroBannerSchema.index({
  isActive: 1,
  status: 1,
  isDeleted: 1,
  sortOrder: 1,
});

const HeroBanner = mongoose.model("HeroBanner", heroBannerSchema);

export default HeroBanner;
