import mongoose from "mongoose";

const characterModeSchema = new mongoose.Schema(
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
      maxlength: 300,
    },

    image: {
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
      required: true,
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

characterModeSchema.index({
  category: 1,
  isActive: 1,
  status: 1,
  isDeleted: 1,
  sortOrder: 1,
});

const CharacterMode = mongoose.model("CharacterMode", characterModeSchema);

export default CharacterMode;
