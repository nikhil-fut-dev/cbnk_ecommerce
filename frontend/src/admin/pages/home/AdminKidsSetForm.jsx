import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Save, X, RefreshCw } from "lucide-react";

import {
  createAdminKidsSet,
  getAdminKidsSetById,
  updateAdminKidsSet,
} from "../../services/adminKidsSetApi";

import { getAdminCategories } from "../../services/adminCategoryApi";

const AdminKidsSetForm = () => {
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
    ctaText: "",
    ctaLink: "",
    ctaOpenInNewTab: false,
  });

  const [categories, setCategories] = useState([]);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");

  const [loading, setLoading] = useState(isEditMode);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const pageTitle = useMemo(
    () => (isEditMode ? "Edit Kids Set" : "Create Kids Set"),
    [isEditMode],
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await getAdminCategories({
        includeInactive: false,
        page: 1,
        limit: 100,
      });

      const data = response?.data?.categories || response?.data || [];

      const activeCategories = Array.isArray(data)
        ? data.filter((category) => category?.isActive === true)
        : [];

      setCategories(activeCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);

      setError(error?.response?.data?.message || "Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadKidsSet = async () => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getAdminKidsSetById(id);

      const kidsSet =
        response?.kidsSet || response?.data?.kidsSet || response?.data;

      if (!kidsSet) {
        throw new Error("Kids Set not found.");
      }

      setForm({
        title: kidsSet.title || "",
        description: kidsSet.description || "",
        category: kidsSet?.category?._id || kidsSet?.category || "",
        sortOrder: kidsSet.sortOrder ?? 0,
        isActive: kidsSet.isActive ?? true,
        status: kidsSet.status || "DRAFT",
        startAt: formatDateTimeLocal(kidsSet.startAt),
        endAt: formatDateTimeLocal(kidsSet.endAt),
        ctaText: kidsSet?.cta?.text || "",
        ctaLink: kidsSet?.cta?.link || "",
        ctaOpenInNewTab: kidsSet?.cta?.openInNewTab ?? false,
      });

      setExistingImage(kidsSet?.image?.url || "");
    } catch (error) {
      console.error("Failed to load Kids Set:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load Kids Set.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadKidsSet();
  }, [id]);

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setError("");

    setImage(selectedFile);

    const previewUrl = URL.createObjectURL(selectedFile);

    setImagePreview(previewUrl);
  };

  const removeNewImage = () => {
    setImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Title is required.";
    }

    if (form.title.trim().length > 100) {
      return "Title cannot exceed 100 characters.";
    }

    if (form.description.length > 300) {
      return "Description cannot exceed 300 characters.";
    }

    if (!form.category) {
      return "Category is required.";
    }

    if (!isEditMode && !image) {
      return "Kids Set image is required.";
    }

    if (form.startAt && form.endAt) {
      const start = new Date(form.startAt);
      const end = new Date(form.endAt);

      if (end < start) {
        return "End date cannot be before start date.";
      }
    }

    return "";
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
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
        ctaText: form.ctaText.trim(),
        ctaLink: form.ctaLink.trim(),
        ctaOpenInNewTab: form.ctaOpenInNewTab,
      };

      if (image) {
        payload.image = image;
      }

      if (isEditMode) {
        await updateAdminKidsSet(id, payload);
      } else {
        await createAdminKidsSet(payload);
      }

      navigate("/admin/home/kids-sets");
    } catch (error) {
      console.error("Failed to save Kids Set:", error);

      setError(error?.response?.data?.message || "Failed to save Kids Set.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw size={30} className="mx-auto animate-spin text-gray-400" />

          <p className="mt-3 text-sm text-gray-500">Loading Kids Set...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/home/kids-sets"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Kids Sets
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>

          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update this Kids Set."
              : "Create a new Kids Set for the CBNK homepage."}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure the title, description and category.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title *
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={100}
                placeholder="e.g. Summer Kids Sets"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />

              <p className="mt-1 text-xs text-gray-400">
                {form.title.length}/100
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={300}
                rows={4}
                placeholder="Short description..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />

              <p className="mt-1 text-xs text-gray-400">
                {form.description.length}/300
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={categoriesLoading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
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
            </div>

            {/* Sort Order */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sort Order
              </label>

              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />

              <p className="mt-1 text-xs text-gray-400">
                Lower numbers appear first.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Settings */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              CTA Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Configure where customers go when they click this Kids Set.
            </p>
          </div>

          <div className="grid gap-5">
            <div>
              <label
                htmlFor="ctaText"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                CTA Text
              </label>
              <input
                id="ctaText"
                name="ctaText"
                type="text"
                maxLength={50}
                value={form.ctaText}
                onChange={handleChange}
                placeholder="Example: Shop Now"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="ctaLink"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                CTA Link
              </label>
              <input
                id="ctaLink"
                name="ctaLink"
                type="text"
                maxLength={500}
                value={form.ctaLink}
                onChange={handleChange}
                placeholder="/products or https://example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter an internal path or an HTTP/HTTPS URL.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4">
              <input
                id="ctaOpenInNewTab"
                name="ctaOpenInNewTab"
                type="checkbox"
                checked={form.ctaOpenInNewTab}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">
                  Open in New Tab
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Open the CTA destination in a new browser tab.
                </span>
              </span>
            </label>
          </div>
        </section>

        {/* Image */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Kids Set Image
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload the image used for this Kids Set.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image {!isEditMode && "*"}
              </label>

              <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 text-center transition hover:border-gray-500 hover:bg-gray-100">
                <ImagePlus size={36} className="text-gray-400" />

                <span className="mt-3 text-sm font-semibold text-gray-700">
                  Choose image
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  PNG, JPG, WEBP — Max 5MB
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {image && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="truncate text-sm text-gray-600">
                    {image.name}
                  </span>

                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="ml-3 rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Preview */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Preview</p>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {imagePreview || existingImage ? (
                  <img
                    src={imagePreview || existingImage}
                    alt={form.title || "Kids Set preview"}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                    No image selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Publishing */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Publishing</h2>

            <p className="mt-1 text-sm text-gray-500">
              Control visibility and publishing schedule.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              >
                <option value="DRAFT">Draft</option>

                <option value="PUBLISHED">Published</option>

                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Active */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Active
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />

                <div>
                  <span className="block text-sm font-medium text-gray-800">
                    Enable Kids Set
                  </span>

                  <span className="block text-xs text-gray-500">
                    Allow this Kids Set to be active.
                  </span>
                </div>
              </label>
            </div>

            {/* Start */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Start Date
              </label>

              <input
                type="datetime-local"
                name="startAt"
                value={form.startAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            {/* End */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                End Date
              </label>

              <input
                type="datetime-local"
                name="endAt"
                value={form.endAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/home/kids-sets"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw size={17} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />

                {isEditMode ? "Update Kids Set" : "Create Kids Set"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const formatDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default AdminKidsSetForm;
