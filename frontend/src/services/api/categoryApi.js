import api from "./axios";

export const getCategories = async (parent = "root") => {
  const response = await api.get("/categories", {
    params: {
      parent,
    },
  });

  return response.data;
};

export const getCategoryBySlug = async (slug) => {
  const response = await api.get(`/categories/${slug}`);

  return response.data;
};
