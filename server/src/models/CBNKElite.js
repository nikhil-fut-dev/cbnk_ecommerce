import mongoose from "mongoose";

const eliteBenefitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 250,
    },

    icon: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: true,
  },
);

const cBNKEliteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 250,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    benefits: {
      type: [eliteBenefitSchema],
      default: [],
    },

    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    validityMonths: {
      type: Number,
      required: true,
      min: 1,
      default: 12,
    },

    taxText: {
      type: String,
      default: "Inclusive of all taxes",
      trim: true,
      maxlength: 100,
    },

    validityText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    logo: {
      url: {
        type: String,
        default: "/logo.png",
        trim: true,
      },

      publicId: {
        type: String,
        default: "",
        trim: true,
      },

      alt: {
        type: String,
        default: "CBNK",
        trim: true,
      },
    },

    ctaText: {
      type: String,
      default: "Join Elite",
      trim: true,
      maxlength: 50,
    },

    ctaLink: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
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

cBNKEliteSchema.index({
  isActive: 1,
  status: 1,
  isDeleted: 1,
});

const CBNKElite = mongoose.model("CBNKElite", cBNKEliteSchema);

export default CBNKElite;
