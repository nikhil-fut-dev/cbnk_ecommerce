import mongoose from "mongoose";

const homeSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      enum: [
        "PROMOTIONAL_TICKER",
        "HERO_BANNER",
        "CHARACTER_MODE",
        "ELITE",
        "KIDS_SETS",
        "SLEEPWEAR",
        "POLO_SHOP",
      ],
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      required: true,
      default: 0,
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

homeSectionSchema.index({
  isActive: 1,
  status: 1,
  isDeleted: 1,
  sortOrder: 1,
});

const HomeSection = mongoose.model("HomeSection", homeSectionSchema);

export default HomeSection;
