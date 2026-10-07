import KidsSet from "../models/KidsSet.js";

// PUBLIC
export const getPublishedKidsSets = async () => {
  const now = new Date();

  const kidsSets = await KidsSet.find({
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
    .populate("category", "name slug isActive")
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();

  return kidsSets;
};

// ADMIN GET ALL
export const getAllKidsSets = async () => {
  return KidsSet.find({
    isDeleted: false,
  })
    .populate("category", "name slug isActive")
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();
};

// ADMIN GET SINGLE
export const getKidsSetById = async (kidsSetId) => {
  return KidsSet.findOne({
    _id: kidsSetId,
    isDeleted: false,
  })
    .populate("category", "name slug isActive")
    .lean();
};

// CREATE
export const createKidsSet = async (kidsSetData) => {
  return KidsSet.create(kidsSetData);
};

// UPDATE
export const updateKidsSet = async (kidsSetId, updateData) => {
  return KidsSet.findOneAndUpdate(
    {
      _id: kidsSetId,
      isDeleted: false,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );
};

// SOFT DELETE
export const deleteKidsSet = async (kidsSetId) => {
  return KidsSet.findOneAndUpdate(
    {
      _id: kidsSetId,
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

// TOGGLE ACTIVE STATUS
export const toggleKidsSetStatus = async (kidsSetId) => {
  const kidsSet = await KidsSet.findOne({
    _id: kidsSetId,
    isDeleted: false,
  });

  if (!kidsSet) {
    return null;
  }

  kidsSet.isActive = !kidsSet.isActive;

  if (!kidsSet.isActive) {
    kidsSet.status = "INACTIVE";
  } else if (kidsSet.status === "INACTIVE") {
    kidsSet.status = "DRAFT";
  }

  await kidsSet.save();

  return kidsSet;
};
