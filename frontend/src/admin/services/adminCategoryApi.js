import api from "../../services/api/axios";

/*
  Get categories for admin
  Backend:
  GET /admin/categories/list

  Supported query:
  includeInactive
  parent
  search
  page
  limit
*/
export const getAdminCategories = async ({
  includeInactive = true,
  parent = "",
  search = "",
  page = 1,
  limit = 20,
} = {}) => {
  const response = await api.get("/categories/admin/list", {
    params: {
      includeInactive,
      parent,
      search,
      page,
      limit,
    },
  });

  return response.data;
};

/*
  Create category

  Backend expects multipart/form-data because
  category image is uploaded through req.file.
*/
export const createAdminCategory = async ({
  name,
  description = "",
  sortOrder = 0,
  parentCategory = "",
  image = null,
}) => {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("description", description);
  formData.append("sortOrder", sortOrder);

  if (parentCategory) {
    formData.append("parentCategory", parentCategory);
  }

  if (image) {
    formData.append("image", image);
  }

  const response = await api.post("/categories", formData);

  return response.data;
};

/*
  Update category

  Backend:
  PUT /categories/:id
*/
export const updateAdminCategory = async (
  categoryId,
  { name, description = "", sortOrder = 0, parentCategory = "", image = null },
) => {
  const formData = new FormData();

  if (name !== undefined) {
    formData.append("name", name);
  }

  if (description !== undefined) {
    formData.append("description", description);
  }

  if (sortOrder !== undefined) {
    formData.append("sortOrder", sortOrder);
  }

  /*
    Empty parentCategory means root category.
    Backend specifically handles empty value as null.
  */
  formData.append("parentCategory", parentCategory || "");

  if (image) {
    formData.append("image", image);
  }

  const response = await api.put(`/categories/${categoryId}`, formData);

  return response.data;
};

/*
  Toggle category active/inactive status

  Backend:
  PATCH /categories/:id/status
*/
export const toggleAdminCategoryStatus = async (categoryId) => {
  const response = await api.patch(`/categories/${categoryId}/status`);

  return response.data;
};

/*
  Delete category

  IMPORTANT:
  Backend performs soft delete.
  It changes isActive -> false.

  It will reject deletion if:
  - active subcategories exist
  - products are assigned to category
*/
export const deleteAdminCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}`);

  return response.data;
};
