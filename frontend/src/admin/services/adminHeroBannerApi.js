import api from "../../services/api/axios";

// ======================================================
// GET ALL HERO BANNERS
// ======================================================

export const getAdminHeroBanners = async () => {
  const response = await api.get("/admin/home/hero-banners");

  return response.data;
};

// ======================================================
// GET SINGLE HERO BANNER
// ======================================================

export const getAdminHeroBannerById = async (id) => {
  const response = await api.get(`/admin/home/hero-banners/${id}`);

  return response.data;
};

// ======================================================
// CREATE HERO BANNER
// ======================================================

export const createAdminHeroBanner = async (bannerData) => {
  const formData = new FormData();

  Object.entries(bannerData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "desktopImage" || key === "mobileImage") {
      if (value instanceof File) {
        formData.append(key, value);
      }

      return;
    }

    formData.append(key, value);
  });

  const response = await api.post("/admin/home/hero-banners", formData);

  return response.data;
};

// ======================================================
// UPDATE HERO BANNER
// ======================================================

export const updateAdminHeroBanner = async (id, bannerData) => {
  const formData = new FormData();

  Object.entries(bannerData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "desktopImage" || key === "mobileImage") {
      if (value instanceof File) {
        formData.append(key, value);
      }

      return;
    }

    formData.append(key, value);
  });

  const response = await api.put(`/admin/home/hero-banners/${id}`, formData);

  return response.data;
};

// ======================================================
// DELETE HERO BANNER
// ======================================================

export const deleteAdminHeroBanner = async (id) => {
  const response = await api.delete(`/admin/home/hero-banners/${id}`);

  return response.data;
};

// ======================================================
// TOGGLE STATUS
// ======================================================

export const toggleAdminHeroBannerStatus = async (id) => {
  const response = await api.patch(`/admin/home/hero-banners/${id}/status`);

  return response.data;
};
