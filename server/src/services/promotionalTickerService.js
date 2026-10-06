import PromotionalTicker from "../models/PromotionalTicker.js";

// =====================================================
// PUBLIC
// Get currently published promotional tickers
// =====================================================
export const getPublishedPromotionalTickers = async () => {
  const now = new Date();

  const tickers = await PromotionalTicker.find({
    isDeleted: false,
    isActive: true,
    status: "PUBLISHED",

    $and: [
      {
        $or: [
          {
            startAt: null,
          },
          {
            startAt: {
              $lte: now,
            },
          },
        ],
      },
      {
        $or: [
          {
            endAt: null,
          },
          {
            endAt: {
              $gte: now,
            },
          },
        ],
      },
    ],
  })
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();

  return tickers;
};

// =====================================================
// ADMIN
// Get all promotional tickers
// =====================================================
export const getAllPromotionalTickers = async () => {
  return PromotionalTicker.find({
    isDeleted: false,
  })
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();
};

// =====================================================
// ADMIN
// Get ticker by ID
// =====================================================
export const getPromotionalTickerById = async (tickerId) => {
  return PromotionalTicker.findOne({
    _id: tickerId,
    isDeleted: false,
  }).lean();
};

// =====================================================
// ADMIN
// Create ticker
// =====================================================
export const createPromotionalTicker = async (tickerData) => {
  return PromotionalTicker.create(tickerData);
};

// =====================================================
// ADMIN
// Update ticker
// =====================================================
export const updatePromotionalTicker = async (tickerId, updateData) => {
  return PromotionalTicker.findOneAndUpdate(
    {
      _id: tickerId,
      isDeleted: false,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );
};

// =====================================================
// ADMIN
// Soft delete ticker
// =====================================================
export const deletePromotionalTicker = async (tickerId) => {
  return PromotionalTicker.findOneAndUpdate(
    {
      _id: tickerId,
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
// Toggle active/inactive
// =====================================================
export const togglePromotionalTickerStatus = async (tickerId) => {
  const ticker = await PromotionalTicker.findOne({
    _id: tickerId,
    isDeleted: false,
  });

  if (!ticker) {
    return null;
  }

  ticker.isActive = !ticker.isActive;

  if (!ticker.isActive) {
    ticker.status = "INACTIVE";
  }

  await ticker.save();

  return ticker;
};
