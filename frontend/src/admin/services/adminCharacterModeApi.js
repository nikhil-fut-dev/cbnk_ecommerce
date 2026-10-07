import api from "../../services/api/axios";

/**
 * Get all Character Modes for admin
 */
export const getAdminCharacterModes = async () => {
  const response = await api.get("/admin/home/character-modes");

  return response.data;
};

/**
 * Get single Character Mode
 */
export const getAdminCharacterModeById = async (id) => {
  const response = await api.get(`/admin/home/character-modes/${id}`);

  return response.data;
};

/**
 * Create Character Mode
 */
export const createAdminCharacterMode = async (characterModeData) => {
  const formData = new FormData();

  Object.entries(characterModeData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "image") {
      if (value instanceof File) {
        formData.append("image", value);
      }

      return;
    }

    formData.append(key, value);
  });

  const response = await api.post("/admin/home/character-modes", formData);

  return response.data;
};

/**
 * Update Character Mode
 */
export const updateAdminCharacterMode = async (id, characterModeData) => {
  const formData = new FormData();

  Object.entries(characterModeData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "image") {
      if (value instanceof File) {
        formData.append("image", value);
      }

      return;
    }

    formData.append(key, value);
  });

  const response = await api.put(`/admin/home/character-modes/${id}`, formData);

  return response.data;
};

/**
 * Delete Character Mode
 */
export const deleteAdminCharacterMode = async (id) => {
  const response = await api.delete(`/admin/home/character-modes/${id}`);

  return response.data;
};

/**
 * Toggle Character Mode status
 */
export const toggleAdminCharacterModeStatus = async (id) => {
  const response = await api.patch(`/admin/home/character-modes/${id}/status`);

  return response.data;
};
