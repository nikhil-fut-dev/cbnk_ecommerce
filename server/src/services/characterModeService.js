import CharacterMode from "../models/CharacterMode.js";

/**
 * Customer:
 * Get only published, active and currently scheduled
 * character mode cards.
 */
export const getPublishedCharacterModes = async () => {
  const now = new Date();

  const characterModes = await CharacterMode.find({
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
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();

  return characterModes;
};

/**
 * Admin:
 * Get all non-deleted character modes.
 */
export const getAllCharacterModes = async () => {
  const characterModes = await CharacterMode.find({
    isDeleted: false,
  })
    .populate("category", "name slug isActive isDeleted")
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
    .lean();

  return characterModes;
};

/**
 * Admin:
 * Get single character mode.
 */
export const getCharacterModeById = async (characterModeId) => {
  return CharacterMode.findOne({
    _id: characterModeId,
    isDeleted: false,
  })
    .populate("category", "name slug isActive isDeleted")
    .lean();
};

/**
 * Admin:
 * Create character mode.
 */
export const createCharacterMode = async (characterModeData) => {
  return CharacterMode.create(characterModeData);
};

/**
 * Admin:
 * Update character mode.
 */
export const updateCharacterMode = async (characterModeId, updateData) => {
  return CharacterMode.findOneAndUpdate(
    {
      _id: characterModeId,
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
 * Soft delete character mode.
 */
export const deleteCharacterMode = async (characterModeId) => {
  return CharacterMode.findOneAndUpdate(
    {
      _id: characterModeId,
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
 * Toggle active/inactive.
 */
export const toggleCharacterModeStatus = async (characterModeId) => {
  const characterMode = await CharacterMode.findOne({
    _id: characterModeId,
    isDeleted: false,
  });

  if (!characterMode) {
    return null;
  }

  characterMode.isActive = !characterMode.isActive;

  if (!characterMode.isActive) {
    characterMode.status = "INACTIVE";
  } else if (characterMode.status === "INACTIVE") {
    characterMode.status = "DRAFT";
  }

  await characterMode.save();

  return characterMode;
};
