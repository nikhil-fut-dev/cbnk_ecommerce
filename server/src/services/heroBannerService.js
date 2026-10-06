import HeroBanner from "../models/HeroBanner.js";

/**
 * Customer:
 * Get only published, active and currently scheduled banners
 */
export const getPublishedHeroBanners = async () => {
  const now = new Date();

  const banners = await HeroBanner.find({
    isDeleted: false,
    isActive: true,
    status: "PUBLISHED",

    $and: [
      {
        $or: [{ startAt: null }, { startAt: { $lte: now } }],
      },
      {
        $or: [{ endAt: null }, { endAt: { $gte: now } }],
      },
    ],
  })
    .populate("category", "name slug")
    .populate("product", "name slug price compareAtPrice images")
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();

  return banners;
};

/**
 * Admin:
 * Get all non-deleted banners
 */
export const getAllHeroBanners = async () => {
  const banners = await HeroBanner.find({
    isDeleted: false,
  })
    .populate("category", "name slug")
    .populate("product", "name slug price compareAtPrice images")
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();

  return banners;
};

/**
 * Admin:
 * Get single banner
 */
export const getHeroBannerById = async (bannerId) => {
  return HeroBanner.findOne({
    _id: bannerId,
    isDeleted: false,
  })
    .populate("category", "name slug")
    .populate("product", "name slug price compareAtPrice images")
    .lean();
};

/**
 * Admin:
 * Create banner
 */
export const createHeroBanner = async (bannerData) => {
  return HeroBanner.create(bannerData);
};

/**
 * Admin:
 * Update banner
 */
export const updateHeroBanner = async (bannerId, updateData) => {
  return HeroBanner.findOneAndUpdate(
    {
      _id: bannerId,
      isDeleted: false,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );
};

/**
 * Admin:
 * Soft delete banner
 */
export const deleteHeroBanner = async (bannerId) => {
  return HeroBanner.findOneAndUpdate(
    {
      _id: bannerId,
      isDeleted: false,
    },
    {
      isDeleted: true,
      isActive: false,
      status: "INACTIVE",
    },
    {
      new: true,
    },
  );
};

/**
 * Admin:
 * Toggle active/inactive
 */
export const toggleHeroBannerStatus = async (bannerId) => {
  const banner = await HeroBanner.findOne({
    _id: bannerId,
    isDeleted: false,
  });

  if (!banner) {
    return null;
  }

  banner.isActive = !banner.isActive;

  if (!banner.isActive) {
    banner.status = "INACTIVE";
  } else if (banner.status === "INACTIVE") {
    banner.status = "DRAFT";
  }

  await banner.save();

  return banner;
};
