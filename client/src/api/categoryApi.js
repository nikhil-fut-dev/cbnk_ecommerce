import api from "./axios";

export const getCategories = async (params = {}) => {
  const response = await api.get("/categories", {
    params,
  });

  return response.data;
};

export const getCategoryBySlug = async (slug) => {
  const response = await api.get(`/categories/${slug}`);

  return response.data;
};