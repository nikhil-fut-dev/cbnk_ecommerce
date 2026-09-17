import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  createAdminCategory,
  updateAdminCategory,
  getAdminCategories,
} from "../../services/adminCategoryApi";

const AdminCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    sortOrder: 0,
    parentCategory: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // -----------------------------------------
  // Load parent categories
  // -----------------------------------------
  const fetchCategories = async () => {
    try {
      const response = await getAdminCategories({
        includeInactive: false,
        parent: "root",
        page: 1,
        limit: 100,
      });

      if (response?.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to load parent categories",
      );
    }
  };

  // -----------------------------------------
  // Load category in edit mode
  // -----------------------------------------
  const fetchCategory = async () => {
    try {
      setLoading(true);

      const response = await getAdminCategories({
        includeInactive: true,
        page: 1,
        limit: 100,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load category");
      }

      const category = (response.data || []).find((item) => item._id === id);

      if (!category) {
        toast.error("Category not found");
        navigate("/admin/categories");
        return;
      }

      setForm({
        name: category.name || "",
        description: category.description || "",
        sortOrder: category.sortOrder ?? 0,
        parentCategory: category.parentCategory?._id || "",
      });

      setImagePreview(category.image || "");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Unable to load category",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    if (isEditMode) {
      fetchCategory();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // -----------------------------------------
  // Input change
  // -----------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -----------------------------------------
  // Image change
  // -----------------------------------------
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB");
      event.target.value = "";
      return;
    }

    // Previous local preview URL ko release karo
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // -----------------------------------------
  // Submit
  // -----------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    if (name.length < 2 || name.length > 50) {
      toast.error("Category name must be between 2 and 50 characters");
      return;
    }

    if (description.length > 500) {
      toast.error("Description cannot exceed 500 characters");
      return;
    }

    const sortOrder = Number(form.sortOrder);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      toast.error("Sort order must be a valid non-negative number");
      return;
    }

    try {
      setSaving(true);

      let response;

      if (isEditMode) {
        response = await updateAdminCategory(id, {
          name,
          description,
          sortOrder,
          parentCategory: form.parentCategory,
          image,
        });
      } else {
        response = await createAdminCategory({
          name,
          description,
          sortOrder,
          parentCategory: form.parentCategory,
          image,
        });
      }

      if (response?.success) {
        toast.success(
          response.message ||
            (isEditMode
              ? "Category updated successfully"
              : "Category created successfully"),
        );

        navigate("/admin/categories");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.message ||
          error.message ||
          "Unable to save category",
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // Loading
  // -----------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">Loading category...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Admin / Categories
            </p>

            <h1 className="mt-1 text-2xl font-bold text-neutral-900">
              {isEditMode ? "Edit Category" : "Create Category"}
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              {isEditMode
                ? "Update category information."
                : "Create a new product category."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Back to Categories
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-800">
                Category Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Electronics"
                maxLength={50}
                disabled={saving}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />

              <p className="mt-1 text-xs text-neutral-400">
                {form.name.length}/50 characters
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-800">
                Sort Order
              </label>

              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                min="0"
                step="1"
                disabled={saving}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />

              <p className="mt-1 text-xs text-neutral-400">
                Lower numbers appear first.
              </p>
            </div>

            {/* Parent Category */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-neutral-800">
                Parent Category
              </label>

              <select
                name="parentCategory"
                value={form.parentCategory}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              >
                <option value="">No Parent — Root Category</option>

                {categories
                  .filter((category) => category._id !== id)
                  .map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>

              <p className="mt-1 text-xs text-neutral-400">
                Leave empty for a root category. Only active root categories can
                be selected as parents.
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-neutral-800">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter category description..."
                maxLength={500}
                rows={5}
                disabled={saving}
                className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />

              <p className="mt-1 text-xs text-neutral-400">
                {form.description.length}/500 characters
              </p>
            </div>

            {/* Image */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-neutral-800">
                Category Image
              </label>

              <div className="rounded-xl border border-dashed border-neutral-300 p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={saving}
                  className="block w-full text-sm text-neutral-600 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800"
                />

                <p className="mt-2 text-xs text-neutral-400">
                  JPG, PNG, WEBP etc. Maximum size: 5 MB.
                </p>

                {imagePreview && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-medium text-neutral-500">
                      Image Preview
                    </p>

                    <div className="h-48 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              disabled={saving}
              className="rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditMode
                  ? "Update Category"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCategoryForm;
