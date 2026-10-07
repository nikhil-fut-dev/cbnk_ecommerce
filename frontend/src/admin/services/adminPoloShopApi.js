import api from "../../services/api/axios";

// =====================================================
// GET ALL POLO SHOPS
// =====================================================

export const getAdminPoloShops = async () => {
  const response = await api.get("/admin/home/polo-shop");

  return response.data;
};

// =====================================================
// GET SINGLE POLO SHOP
// =====================================================

export const getAdminPoloShopById = async (id) => {
  const response = await api.get(`/admin/home/polo-shop/${id}`);

  return response.data;
};

// =====================================================
// CREATE POLO SHOP
// =====================================================

export const createAdminPoloShop = async (poloShopData) => {
  const formData = new FormData();

  Object.entries(poloShopData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    // Images
    if (key === "desktopImage" || key === "mobileImage") {
      if (value instanceof File) {
        formData.append(key, value);
      }

      return;
    }

    formData.append(key, value);
  });

  const response = await api.post("/admin/home/polo-shop", formData);

  return response.data;
};

// =====================================================
// UPDATE POLO SHOP
// =====================================================

export const updateAdminPoloShop = async (id, poloShopData) => {
  const formData = new FormData();

  Object.entries(poloShopData).forEach(([key, value]) => {
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

  const response = await api.put(`/admin/home/polo-shop/${id}`, formData);

  return response.data;
};

// =====================================================
// DELETE POLO SHOP
// =====================================================

export const deleteAdminPoloShop = async (id) => {
  const response = await api.delete(`/admin/home/polo-shop/${id}`);

  return response.data;
};

// =====================================================
// TOGGLE POLO SHOP STATUS
// =====================================================

export const toggleAdminPoloShopStatus = async (id) => {
  const response = await api.patch(`/admin/home/polo-shop/${id}/status`);

  return response.data;
};
