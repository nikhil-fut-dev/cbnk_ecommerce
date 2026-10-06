import mongoose from "mongoose";

const promotionalTickerSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      maxlength: 50,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
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

promotionalTickerSchema.index({
  isActive: 1,
  status: 1,
  isDeleted: 1,
  sortOrder: 1,
});

const PromotionalTicker = mongoose.model(
  "PromotionalTicker",
  promotionalTickerSchema,
);

export default PromotionalTicker;
