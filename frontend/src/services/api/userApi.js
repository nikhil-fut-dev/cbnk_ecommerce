import api from "./axios";

// Get current user's profile
export const getProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

// Update current user's profile
export const updateProfile = async ({ fullName, username, phone }) => {
  const response = await api.put("/users/me", {
    fullName,
    username,
    phone,
  });

  return response.data;
};

// Change current user's password
export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.put("/users/change-password", {
    currentPassword,
    newPassword,
  });

  return response.data;
};
