import SleepwearEdit from "../models/SleepwearEdit.js";

// PUBLIC
export const getPublishedSleepwearEdits = async () => {
  const now = new Date();

  const sleepwearEdits = await SleepwearEdit.find({
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

  return sleepwearEdits;
};

// ADMIN GET ALL
export const getAllSleepwearEdits = async () => {
  return SleepwearEdit.find({
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

// ADMIN GET SINGLE
export const getSleepwearEditById = async (sleepwearEditId) => {
  return SleepwearEdit.findOne({
    _id: sleepwearEditId,
    isDeleted: false,
  })
    .populate("category", "name slug isActive isDeleted")
    .populate(
      "product",
      "name slug price compareAtPrice images isActive isDeleted",
    )
    .lean();
};

// CREATE
export const createSleepwearEdit = async (sleepwearEditData) => {
  return SleepwearEdit.create(sleepwearEditData);
};

// UPDATE
export const updateSleepwearEdit = async (sleepwearEditId, updateData) => {
  return SleepwearEdit.findOneAndUpdate(
    {
      _id: sleepwearEditId,
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
export const deleteSleepwearEdit = async (sleepwearEditId) => {
  return SleepwearEdit.findOneAndUpdate(
    {
      _id: sleepwearEditId,
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
export const toggleSleepwearEditStatus = async (sleepwearEditId) => {
  const sleepwearEdit = await SleepwearEdit.findOne({
    _id: sleepwearEditId,
    isDeleted: false,
  });

  if (!sleepwearEdit) {
    return null;
  }

  sleepwearEdit.isActive = !sleepwearEdit.isActive;

  if (!sleepwearEdit.isActive) {
    sleepwearEdit.status = "INACTIVE";
  } else if (sleepwearEdit.status === "INACTIVE") {
    sleepwearEdit.status = "DRAFT";
  }

  await sleepwearEdit.save();

  return sleepwearEdit;
};
