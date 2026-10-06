import mongoose from "mongoose";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/uploadToCloudinary.js";

import {
  getPublishedHeroBanners,
  getAllHeroBanners,
  getHeroBannerById,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  toggleHeroBannerStatus,
} from "../services/heroBannerService.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/* =========================================================
   CUSTOMER
========================================================= */

export const getHeroBanners = async (req, res) => {
  try {
    const banners = await getPublishedHeroBanners();

    return res.status(200).json({
      success: true,
      message: "Hero banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    console.error("Get hero banners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hero banners",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - GET ALL
========================================================= */

export const getAdminHeroBanners = async (req, res) => {
  try {
    const banners = await getAllHeroBanners();

    return res.status(200).json({
      success: true,
      message: "Hero banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    console.error("Get admin hero banners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hero banners",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - GET SINGLE
========================================================= */

export const getAdminHeroBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero banner ID",
        errors: [],
      });
    }

    const banner = await getHeroBannerById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Hero banner not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hero banner fetched successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Get admin hero banner error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hero banner",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - CREATE
========================================================= */

export const createAdminHeroBanner = async (req, res) => {
  let desktopUpload = null;
  let mobileUpload = null;

  try {
    const {
      smallText,
      title,
      description,
      ctaText,
      ctaLink,
      category,
      product,
      sortOrder,
      isActive,
      status,
      startAt,
      endAt,
      desktopAlt,
      mobileAlt,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Hero banner title is required",
        errors: [],
      });
    }

    const desktopFile = req.files?.desktopImage?.[0];

    const mobileFile = req.files?.mobileImage?.[0];

    if (!desktopFile) {
      return res.status(400).json({
        success: false,
        message: "Desktop image is required",
        errors: [],
      });
    }

    if (!mobileFile) {
      return res.status(400).json({
        success: false,
        message: "Mobile image is required",
        errors: [],
      });
    }

    /*
     * Upload desktop image
     */
    desktopUpload = await uploadToCloudinary(
      desktopFile.buffer,
      "cbnk/home/hero-banners",
    );

    /*
     * Upload mobile image
     */
    mobileUpload = await uploadToCloudinary(
      mobileFile.buffer,
      "cbnk/home/hero-banners",
    );

    const banner = await createHeroBanner({
      smallText,
      title,
      description,

      desktopImage: {
        url: desktopUpload.url,
        publicId: desktopUpload.publicId,
        alt: desktopAlt || "",
      },

      mobileImage: {
        url: mobileUpload.url,
        publicId: mobileUpload.publicId,
        alt: mobileAlt || "",
      },

      ctaText,
      ctaLink,

      category: category || null,
      product: product || null,

      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,

      isActive:
        isActive !== undefined
          ? isActive === "true" || isActive === true
          : true,

      status: status || "DRAFT",

      startAt: startAt || null,
      endAt: endAt || null,
    });

    return res.status(201).json({
      success: true,
      message: "Hero banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Create admin hero banner error:", error);

    /*
     * Database create fail hone par uploaded images
     * ko Cloudinary se remove karna
     */
    if (desktopUpload?.publicId) {
      await deleteFromCloudinary(desktopUpload.publicId);
    }

    if (mobileUpload?.publicId) {
      await deleteFromCloudinary(mobileUpload.publicId);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create hero banner",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - UPDATE
========================================================= */

export const updateAdminHeroBanner = async (req, res) => {
  let newDesktopUpload = null;
  let newMobileUpload = null;

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero banner ID",
        errors: [],
      });
    }

    const existingBanner = await getHeroBannerById(id);

    if (!existingBanner) {
      return res.status(404).json({
        success: false,
        message: "Hero banner not found",
        errors: [],
      });
    }

    const {
      smallText,
      title,
      description,
      ctaText,
      ctaLink,
      category,
      product,
      sortOrder,
      isActive,
      status,
      startAt,
      endAt,
      desktopAlt,
      mobileAlt,
    } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Hero banner title cannot be empty",
        errors: [],
      });
    }

    const updateData = {};

    if (smallText !== undefined) {
      updateData.smallText = smallText;
    }

    if (title !== undefined) {
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (ctaText !== undefined) {
      updateData.ctaText = ctaText;
    }

    if (ctaLink !== undefined) {
      updateData.ctaLink = ctaLink;
    }

    if (category !== undefined) {
      updateData.category = category || null;
    }

    if (product !== undefined) {
      updateData.product = product || null;
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = Number(sortOrder);
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive === "true" || isActive === true;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (startAt !== undefined) {
      updateData.startAt = startAt || null;
    }

    if (endAt !== undefined) {
      updateData.endAt = endAt || null;
    }

    /*
     * Check new images
     */
    const desktopFile = req.files?.desktopImage?.[0];

    const mobileFile = req.files?.mobileImage?.[0];

    /*
     * New desktop image
     */
    if (desktopFile) {
      newDesktopUpload = await uploadToCloudinary(
        desktopFile.buffer,
        "cbnk/home/hero-banners",
      );

      updateData.desktopImage = {
        url: newDesktopUpload.url,
        publicId: newDesktopUpload.publicId,
        alt:
          desktopAlt !== undefined
            ? desktopAlt
            : existingBanner.desktopImage?.alt || "",
      };
    } else if (desktopAlt !== undefined) {
      updateData.desktopImage = {
        ...existingBanner.desktopImage,
        alt: desktopAlt,
      };
    }

    /*
     * New mobile image
     */
    if (mobileFile) {
      newMobileUpload = await uploadToCloudinary(
        mobileFile.buffer,
        "cbnk/home/hero-banners",
      );

      updateData.mobileImage = {
        url: newMobileUpload.url,
        publicId: newMobileUpload.publicId,
        alt:
          mobileAlt !== undefined
            ? mobileAlt
            : existingBanner.mobileImage?.alt || "",
      };
    } else if (mobileAlt !== undefined) {
      updateData.mobileImage = {
        ...existingBanner.mobileImage,
        alt: mobileAlt,
      };
    }

    const updatedBanner = await updateHeroBanner(id, updateData);

    if (!updatedBanner) {
      /*
       * Agar update fail hua aur new images upload
       * ho chuki hain to unhe cleanup karo.
       */
      if (newDesktopUpload?.publicId) {
        await deleteFromCloudinary(newDesktopUpload.publicId);
      }

      if (newMobileUpload?.publicId) {
        await deleteFromCloudinary(newMobileUpload.publicId);
      }

      return res.status(404).json({
        success: false,
        message: "Hero banner not found",
        errors: [],
      });
    }

    /*
     * New image successfully save hone ke baad
     * old Cloudinary image delete karo.
     */
    if (newDesktopUpload?.publicId && existingBanner.desktopImage?.publicId) {
      await deleteFromCloudinary(existingBanner.desktopImage.publicId);
    }

    if (newMobileUpload?.publicId && existingBanner.mobileImage?.publicId) {
      await deleteFromCloudinary(existingBanner.mobileImage.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Hero banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Update admin hero banner error:", error);

    /*
     * Agar new image upload hui but database update
     * fail hua to new image cleanup karo.
     */
    if (newDesktopUpload?.publicId) {
      await deleteFromCloudinary(newDesktopUpload.publicId);
    }

    if (newMobileUpload?.publicId) {
      await deleteFromCloudinary(newMobileUpload.publicId);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update hero banner",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - DELETE
========================================================= */

export const deleteAdminHeroBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero banner ID",
        errors: [],
      });
    }

    const banner = await getHeroBannerById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Hero banner not found",
        errors: [],
      });
    }

    const deletedBanner = await deleteHeroBanner(id);

    /*
     * Soft delete ke saath Cloudinary images bhi
     * remove kar rahe hain.
     */
    if (banner.desktopImage?.publicId) {
      await deleteFromCloudinary(banner.desktopImage.publicId);
    }

    if (banner.mobileImage?.publicId) {
      await deleteFromCloudinary(banner.mobileImage.publicId);
    }

    return res.status(200).json({
      success: true,
      message: "Hero banner deleted successfully",
      data: deletedBanner,
    });
  } catch (error) {
    console.error("Delete admin hero banner error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete hero banner",
      errors: [error.message],
    });
  }
};

/* =========================================================
   ADMIN - TOGGLE STATUS
========================================================= */

export const toggleAdminHeroBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hero banner ID",
        errors: [],
      });
    }

    const banner = await toggleHeroBannerStatus(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Hero banner not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hero banner status updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Toggle hero banner status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update hero banner status",
      errors: [error.message],
    });
  }
};
