import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  createAdminCharacterMode,
  getAdminCharacterModeById,
  updateAdminCharacterMode,
} from "../../services/adminCharacterModeApi";

import { getAdminCategories } from "../../services/adminCategoryApi";

const AdminCharacterModeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    sortOrder: 0,
    isActive: true,
    status: "DRAFT",
    startAt: "",
    endAt: "",
  });

  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  /*
   * Load categories
   */
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await getAdminCategories({
        includeInactive: false,
        page: 1,
        limit: 100,
      });

      const data = response?.data?.categories || response?.data || [];

      console.log("CATEGORY RESPONSE:", response);
      console.log("CATEGORY DATA:", data);

      const activeCategories = Array.isArray(data)
        ? data.filter((category) => category?.isActive === true)
        : [];

      console.log("ACTIVE CATEGORIES:", activeCategories);

      setCategories(activeCategories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);

      setError(err?.response?.data?.message || "Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  /*
   * Load existing Character Mode
   */
  const fetchCharacterMode = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCharacterModeById(id);

      const item = response?.data?.characterMode || response?.data;

      if (!item) {
        throw new Error("Character Mode data not found.");
      }

      setForm({
        title: item?.title || "",
        description: item?.description || "",
        category: item?.category?._id || item?.category || "",
        sortOrder: item?.sortOrder ?? 0,
        isActive: item?.isActive ?? item?.active ?? true,
        status: item?.status || "DRAFT",
        startAt: formatDateTimeLocal(item?.startAt),
        endAt: formatDateTimeLocal(item?.endAt),
      });

      setExistingImage(item?.image?.url || "");
    } catch (err) {
      console.error("Failed to fetch Character Mode:", err);

      setError(
        err?.response?.data?.message || "Failed to load Character Mode.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    if (isEditMode) {
      fetchCharacterMode();
    }
  }, [id]);

  /*
   * Convert backend date into
   * datetime-local input format
   */
  const formatDateTimeLocal = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const offset = parsedDate.getTimezoneOffset();

    const localDate = new Date(parsedDate.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
  };

  /*
   * Convert datetime-local value
   * to ISO string
   */
  const toISOStringOrNull = (value) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  };

  /*
   * Input change
   */
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
  };

  /*
   * Image change
   */
  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    setImage(file);

    setFieldErrors((previous) => ({
      ...previous,
      image: "",
    }));

    setError("");
  };

  /*
   * Validation
   */
  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "Title is required.";
    }

    if (!form.category) {
      errors.category = "Category is required.";
    }

    if (!isEditMode && !image) {
      errors.image = "Character Mode image is required.";
    }

    if (form.startAt && form.endAt) {
      const start = new Date(form.startAt);
      const end = new Date(form.endAt);

      if (start >= end) {
        errors.endAt = "End date must be after start date.";
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /*
   * Submit
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        status: form.status,
        startAt: toISOStringOrNull(form.startAt),
        endAt: toISOStringOrNull(form.endAt),
      };

      /*
       * Image is only sent when:
       * - creating
       * - replacing image during edit
       */
      if (image) {
        payload.image = image;
      }

      if (isEditMode) {
        await updateAdminCharacterMode(id, payload);
      } else {
        await createAdminCharacterMode(payload);
      }

      navigate("/admin/home/character-modes");
    } catch (err) {
      console.error("Failed to save Character Mode:", err);
      console.error("STATUS:", err?.response?.status);
      console.error("RESPONSE DATA:", err?.response?.data);

      setError(
        err?.response?.data?.message || "Failed to save Character Mode.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">Loading Character Mode...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Character Mode" : "Create Character Mode"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Configure the Character Mode section shown on the customer homepage.
          </p>
        </div>

        <Link
          to="/admin/home/character-modes"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Back
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the main Character Mode content.
            </p>
          </div>

          <div className="grid gap-5">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Title
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: Superhero"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                  fieldErrors.title
                    ? "border-red-300 focus:ring-red-100"
                    : "border-gray-300 focus:border-black focus:ring-gray-100"
                }`}
              />

              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Enter Character Mode description..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
              />
            </div>
          </div>
        </section>

        {/* Category */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Category</h2>

            <p className="mt-1 text-sm text-gray-500">
              Select the category associated with this Character Mode.
            </p>
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category
              <span className="ml-1 text-red-500">*</span>
            </label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={categoriesLoading}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                fieldErrors.category
                  ? "border-red-300 focus:ring-red-100"
                  : "border-gray-300 focus:border-black focus:ring-gray-100"
              }`}
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {fieldErrors.category && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.category}
              </p>
            )}
          </div>
        </section>

        {/* Image */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Character Image
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload the image used for this Character Mode.
            </p>
          </div>

          {/* Existing image */}
          {existingImage && !image && (
            <div className="mb-5">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Current Image
              </p>

              <img
                src={existingImage}
                alt="Current Character Mode"
                className="h-48 w-48 rounded-xl object-cover"
              />
            </div>
          )}

          {/* New preview */}
          {image && (
            <div className="mb-5">
              <p className="mb-2 text-sm font-medium text-gray-700">
                New Image Preview
              </p>

              <img
                src={URL.createObjectURL(image)}
                alt="New Character Mode"
                className="h-48 w-48 rounded-xl object-cover"
              />
            </div>
          )}

          <label
            htmlFor="image"
            className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-gray-500"
          >
            <div className="text-sm font-medium text-gray-700">
              {image
                ? "Choose another image"
                : isEditMode
                  ? "Choose replacement image"
                  : "Choose Character Mode image"}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Click to browse files
            </div>

            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {image && (
            <p className="mt-2 text-xs text-gray-500">Selected: {image.name}</p>
          )}

          {fieldErrors.image && (
            <p className="mt-2 text-xs text-red-600">{fieldErrors.image}</p>
          )}
        </section>

        {/* Publishing */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Publishing & Schedule
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Control visibility and publishing schedule.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Sort Order */}
            <div>
              <label
                htmlFor="sortOrder"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Sort Order
              </label>

              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
              >
                <option value="DRAFT">Draft</option>

                <option value="PUBLISHED">Published</option>

                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Start */}
            <div>
              <label
                htmlFor="startAt"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Start At
              </label>

              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                value={form.startAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {/* End */}
            <div>
              <label
                htmlFor="endAt"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                End At
              </label>

              <input
                id="endAt"
                name="endAt"
                type="datetime-local"
                value={form.endAt}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                  fieldErrors.endAt
                    ? "border-red-300 focus:ring-red-100"
                    : "border-gray-300 focus:border-black focus:ring-gray-100"
                }`}
              />

              {fieldErrors.endAt && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.endAt}</p>
              )}
            </div>
          </div>

          {/* Active */}
          <div className="mt-5 flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Active</p>

              <p className="mt-1 text-xs text-gray-500">
                Enable or disable this Character Mode.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setForm((previous) => ({
                  ...previous,
                  isActive: !previous.isActive,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                form.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  form.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/home/character-modes"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : isEditMode
                ? "Update Character Mode"
                : "Create Character Mode"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCharacterModeForm;
