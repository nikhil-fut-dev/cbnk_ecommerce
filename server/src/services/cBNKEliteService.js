import CBNKElite from "../models/CBNKElite.js";

export const getPublishedCBNKElite = async () => {
  const now = new Date();

  const elite = await CBNKElite.findOne({
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
    .sort({ createdAt: -1 })
    .lean();

  return elite;
};

export const getAllCBNKElite = async () => {
  return CBNKElite.find({
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .lean();
};

export const getCBNKEliteById = async (eliteId) => {
  return CBNKElite.findOne({
    _id: eliteId,
    isDeleted: false,
  }).lean();
};

export const createCBNKElite = async (eliteData) => {
  return CBNKElite.create(eliteData);
};

export const updateCBNKElite = async (eliteId, updateData) => {
  return CBNKElite.findOneAndUpdate(
    {
      _id: eliteId,
      isDeleted: false,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );
};

export const deleteCBNKElite = async (eliteId) => {
  return CBNKElite.findOneAndUpdate(
    {
      _id: eliteId,
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

export const toggleCBNKEliteStatus = async (eliteId) => {
  const elite = await CBNKElite.findOne({
    _id: eliteId,
    isDeleted: false,
  });

  if (!elite) {
    return null;
  }

  elite.isActive = !elite.isActive;

  if (!elite.isActive) {
    elite.status = "INACTIVE";
  } else if (elite.status === "INACTIVE") {
    elite.status = "DRAFT";
  }

  await elite.save();

  return elite;
};
