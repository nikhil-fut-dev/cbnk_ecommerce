import PoloShop from "../models/PoloShop.js";

// =====================================================
// PUBLIC
// Get Published Polo Shops
// =====================================================

export const getPublishedPoloShops = async () => {
  const now = new Date();

  const poloShops = await PoloShop.find({
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
    .populate("category", "name slug isActive isDeleted")
    .populate(
      "product",
      "name slug price compareAtPrice images isActive isDeleted",
    )
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();

  return poloShops;
};

// =====================================================
// ADMIN
// Get All Polo Shops
// =====================================================

export const getAllPoloShops = async () => {
  return PoloShop.find({
    isDeleted: false,
  })
    .populate("category", "name slug isActive isDeleted")
    .populate(
      "product",
      "name slug price compareAtPrice images isActive isDeleted",
    )
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();
};

// =====================================================
// ADMIN
// Get Single Polo Shop
// =====================================================

export const getPoloShopById = async (poloShopId) => {
  return PoloShop.findOne({
    _id: poloShopId,
    isDeleted: false,
  })
    .populate("category", "name slug isActive isDeleted")
    .populate(
      "product",
      "name slug price compareAtPrice images isActive isDeleted",
    )
    .lean();
};

// =====================================================
// ADMIN
// Create Polo Shop
// =====================================================

export const createPoloShop = async (poloShopData) => {
  return PoloShop.create(poloShopData);
};

// =====================================================
// ADMIN
// Update Polo Shop
// =====================================================

export const updatePoloShop = async (poloShopId, updateData) => {
  return PoloShop.findOneAndUpdate(
    {
      _id: poloShopId,
      isDeleted: false,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("category", "name slug isActive isDeleted")
    .populate(
      "product",
      "name slug price compareAtPrice images isActive isDeleted",
    );
};

// =====================================================
// ADMIN
// Soft Delete Polo Shop
// =====================================================

export const deletePoloShop = async (poloShopId) => {
  return PoloShop.findOneAndUpdate(
    {
      _id: poloShopId,
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

// =====================================================
// ADMIN
// Toggle Active / Inactive
// =====================================================

export const togglePoloShopStatus = async (poloShopId) => {
  const poloShop = await PoloShop.findOne({
    _id: poloShopId,
    isDeleted: false,
  });

  if (!poloShop) {
    return null;
  }

  poloShop.isActive = !poloShop.isActive;

  if (!poloShop.isActive) {
    poloShop.status = "INACTIVE";
  } else if (poloShop.status === "INACTIVE") {
    poloShop.status = "DRAFT";
  }

  await poloShop.save();

  return poloShop;
};
