import HomeSection from "../models/HomeSection.js";

import { getPublishedPromotionalTickers } from "./promotionalTickerService.js";

import { getPublishedHeroBanners } from "./heroBannerService.js";

import { getPublishedCharacterModes } from "./characterModeService.js";

import { getPublishedCBNKElite } from "./cBNKEliteService.js";

import { getPublishedKidsSets } from "./kidsSetService.js";

import { getPublishedSleepwearEdits } from "./sleepwearEditService.js";

import { getPublishedPoloShops } from "./poloShopService.js";

export const getPublishedHomeSections = async () => {
  const now = new Date();

  const sections = await HomeSection.find({
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
    .sort({ sortOrder: 1 })
    .lean();

  return sections;
};

export const getAllHomeSections = async () => {
  const sections = await HomeSection.find({
    isDeleted: false,
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return sections;
};

export const getHomeSectionById = async (sectionId) => {
  return HomeSection.findOne({
    _id: sectionId,
    isDeleted: false,
  }).lean();
};

export const createHomeSection = async (sectionData) => {
  return HomeSection.create(sectionData);
};

export const updateHomeSection = async (sectionId, updateData) => {
  return HomeSection.findOneAndUpdate(
    {
      _id: sectionId,
      isDeleted: false,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );
};

export const deleteHomeSection = async (sectionId) => {
  return HomeSection.findOneAndUpdate(
    {
      _id: sectionId,
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

export const toggleHomeSectionStatus = async (sectionId) => {
  const section = await HomeSection.findOne({
    _id: sectionId,
    isDeleted: false,
  });

  if (!section) {
    return null;
  }

  section.isActive = !section.isActive;

  if (!section.isActive) {
    section.status = "INACTIVE";
  }

  await section.save();

  return section;
};

// =====================================================
// PUBLIC
// Get Complete Published Home Data
// =====================================================

export const getPublishedHomeData = async () => {
  const [
    promotionalTicker,
    heroBanners,
    characterModes,
    elite,
    kidsSets,
    sleepwearEdits,
    poloShops,
  ] = await Promise.all([
    getPublishedPromotionalTickers(),
    getPublishedHeroBanners(),
    getPublishedCharacterModes(),
    getPublishedCBNKElite(),
    getPublishedKidsSets(),
    getPublishedSleepwearEdits(),
    getPublishedPoloShops(),
  ]);

  return {
    promotionalTicker,
    heroBanners,
    characterModes,
    elite,
    kidsSets,
    sleepwearEdits,
    poloShops,
  };
};
