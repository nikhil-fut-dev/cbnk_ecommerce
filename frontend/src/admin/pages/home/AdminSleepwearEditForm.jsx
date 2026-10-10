import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Loader2, Save, X } from "lucide-react";

import {
  getAdminSleepwearEditById,
  createAdminSleepwearEdit,
  updateAdminSleepwearEdit,
} from "../../services/adminSleepwearEditApi";

import { getAdminCategories } from "../../services/adminCategoryApi";
import { getAdminProducts } from "../../services/adminProductApi";

const AdminSleepwearEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");

  const [form, setForm] = useState({
    smallText: "",
    title: "",
    priceText: "",

    category: "",
    product: "",

    desktopImage: null,
    desktopImageAlt: "",

    mobileImage: null,
    mobileImageAlt: "",

    sortOrder: 0,

    isActive: true,
    status: "DRAFT",

    startAt: "",
    endAt: "",

    ctaText: "",
    ctaLink: "",
    ctaOpenInNewTab: false,
  });

  // ---------------------------------------
  // Load categories
  // ---------------------------------------
  const loadCategories = async () => {
    try {
      const response = await getAdminCategories({
        includeInactive: false,
        page: 1,
        limit: 100,
      });

      const data =
        response?.data?.categories ||
        response?.categories ||
        response?.data ||
        [];

      const activeCategories = Array.isArray(data)
        ? data.filter((category) => category?.isActive === true)
        : [];

      setCategories(activeCategories);
    } catch (err) {
      console.error("Category loading error:", err);

      setError(err?.response?.data?.message || "Failed to load categories");
    }
  };

  // ---------------------------------------
  // Load products
  // ---------------------------------------
  const loadProducts = async () => {
    try {
      const response = await getAdminProducts({
        page: 1,
        limit: 100,
        isDeleted: false,
      });

      const data =
        response?.data?.products || response?.products || response?.data || [];

      const activeProducts = Array.isArray(data)
        ? data.filter(
            (product) =>
              product?.isActive === true && product?.isDeleted !== true,
          )
        : [];

      setProducts(activeProducts);
    } catch (err) {
      console.error("Product loading error:", err);

      setError(err?.response?.data?.message || "Failed to load products");
    }
  };

  // ---------------------------------------
  // Load existing sleepwear
  // ---------------------------------------
  const loadSleepwearEdit = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await getAdminSleepwearEditById(id);

      const sleepwear =
        response?.sleepwearEdit ||
        response?.data?.sleepwearEdit ||
        response?.data;

      if (!sleepwear) {
        throw new Error("Sleepwear edit data not found");
      }

      setForm({
        smallText: sleepwear.smallText || "",
        title: sleepwear.title || "",
        priceText: sleepwear.priceText || "",

        category: sleepwear.category?._id || sleepwear.category || "",

        product: sleepwear.product?._id || sleepwear.product || "",

        desktopImage: null,

        desktopImageAlt: sleepwear.desktopImage?.alt || "",

        mobileImage: null,

        mobileImageAlt: sleepwear.mobileImage?.alt || "",

        sortOrder: sleepwear.sortOrder ?? 0,

        isActive: sleepwear.isActive ?? true,

        status: sleepwear.status || "DRAFT",

        startAt: formatDateTimeLocal(sleepwear.startAt),

        endAt: formatDateTimeLocal(sleepwear.endAt),

        ctaText: sleepwear?.cta?.text || "",

        ctaLink: sleepwear?.cta?.link || "",

        ctaOpenInNewTab: sleepwear?.cta?.openInNewTab ?? false,
      });

      setDesktopPreview(sleepwear.desktopImage?.url || "");

      setMobilePreview(sleepwear.mobileImage?.url || "");
    } catch (err) {
      console.error("Sleepwear loading error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load sleepwear edit",
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // Initial loading
  // ---------------------------------------
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([loadCategories(), loadProducts()]);

      if (isEditMode) {
        await loadSleepwearEdit();
      }
    };

    initialize();
  }, [id]);

  // ---------------------------------------
  // Input handler
  // ---------------------------------------
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ---------------------------------------
  // Desktop image
  // ---------------------------------------
  const handleDesktopImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      desktopImage: file,
    }));

    setDesktopPreview(URL.createObjectURL(file));
  };

  // ---------------------------------------
  // Mobile image
  // ---------------------------------------
  const handleMobileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      mobileImage: file,
    }));

    setMobilePreview(URL.createObjectURL(file));
  };

  // ---------------------------------------
  // Remove desktop image
  // ---------------------------------------
  const removeDesktopImage = () => {
    setForm((prev) => ({
      ...prev,
      desktopImage: null,
    }));

    setDesktopPreview("");
  };

  // ---------------------------------------
  // Remove mobile image
  // ---------------------------------------
  const removeMobileImage = () => {
    setForm((prev) => ({
      ...prev,
      mobileImage: null,
    }));

    setMobilePreview("");
  };

  // ---------------------------------------
  // Date conversion
  // ---------------------------------------
  const toISOStringOrNull = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  };

  // ---------------------------------------
  // Submit
  // ---------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------
    // Title validation
    // -------------------------------
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    // -------------------------------
    // Category OR Product
    // -------------------------------
    if (!form.category && !form.product) {
      setError("Please select at least a category or a product.");
      return;
    }

    // -------------------------------
    // Create image validation
    // -------------------------------
    if (!isEditMode) {
      if (!form.desktopImage) {
        setError("Desktop image is required.");
        return;
      }

      if (!form.mobileImage) {
        setError("Mobile image is required.");
        return;
      }
    }

    // -------------------------------
    // Date validation
    // -------------------------------
    if (form.startAt && form.endAt) {
      const start = new Date(form.startAt);
      const end = new Date(form.endAt);

      if (end < start) {
        setError("End date cannot be before start date.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        smallText: form.smallText.trim(),

        title: form.title.trim(),

        priceText: form.priceText.trim(),

        category: form.category || "",

        product: form.product || "",

        desktopImageAlt: form.desktopImageAlt.trim(),

        mobileImageAlt: form.mobileImageAlt.trim(),

        sortOrder: Number(form.sortOrder) || 0,

        isActive: form.isActive,

        status: form.status,

        startAt: toISOStringOrNull(form.startAt),

        endAt: toISOStringOrNull(form.endAt),

        ctaText: form.ctaText.trim(),

        ctaLink: form.ctaLink.trim(),

        ctaOpenInNewTab: form.ctaOpenInNewTab,
      };

      // Images only when selected
      if (form.desktopImage) {
        payload.desktopImage = form.desktopImage;
      }

      if (form.mobileImage) {
        payload.mobileImage = form.mobileImage;
      }

      if (isEditMode) {
        await updateAdminSleepwearEdit(id, payload);

        setSuccess("Sleepwear Edit updated successfully.");
      } else {
        await createAdminSleepwearEdit(payload);

        setSuccess("Sleepwear Edit created successfully.");
      }

      setTimeout(() => {
        navigate("/admin/home/sleepwear");
      }, 700);
    } catch (err) {
      console.error("Sleepwear submit error:", err);

      setError(
        err?.response?.data?.message || "Failed to save sleepwear edit.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------
  // Loading screen
  // ---------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/admin/home/sleepwear"
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sleepwear
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Sleepwear" : "Create Sleepwear"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the Sleepwear Edit section displayed on the customer home
            page.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* -------------------------------- */}
        {/* Basic Information */}
        {/* -------------------------------- */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <p className="text-sm text-gray-500">
              Main content displayed in the sleepwear section.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Small Text */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Small Text
              </label>

              <input
                type="text"
                name="smallText"
                value={form.smallText}
                onChange={handleChange}
                maxLength={150}
                placeholder="Example: NEW ARRIVALS"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            {/* Price Text */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Price Text
              </label>

              <input
                type="text"
                name="priceText"
                value={form.priceText}
                onChange={handleChange}
                maxLength={100}
                placeholder="Example: Starting from ₹999"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Title *</label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                required
                placeholder="Example: The Sleepwear Edit"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* -------------------------------- */}
        {/* CTA Settings */}
        {/* -------------------------------- */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">CTA Settings</h2>

            <p className="text-sm text-gray-500">
              Configure where customers go when they click the Sleepwear Edit.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* CTA Text */}
            <div>
              <label
                htmlFor="ctaText"
                className="mb-2 block text-sm font-medium"
              >
                CTA Text
              </label>

              <input
                id="ctaText"
                type="text"
                name="ctaText"
                value={form.ctaText}
                onChange={handleChange}
                maxLength={50}
                placeholder="Example: Shop Now"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            {/* CTA Link */}
            <div>
              <label
                htmlFor="ctaLink"
                className="mb-2 block text-sm font-medium"
              >
                CTA Link
              </label>

              <input
                id="ctaLink"
                type="text"
                name="ctaLink"
                value={form.ctaLink}
                onChange={handleChange}
                maxLength={500}
                placeholder="/products or https://example.com"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />

              <p className="mt-1 text-xs text-gray-500">
                Enter an internal path or an HTTP/HTTPS URL.
              </p>
            </div>

            {/* Open in New Tab */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="ctaOpenInNewTab"
                  checked={form.ctaOpenInNewTab}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4"
                />

                <span>
                  <span className="block text-sm font-medium">
                    Open in New Tab
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    Open the CTA destination in a new browser tab.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* -------------------------------- */}
        {/* Relations */}
        {/* -------------------------------- */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Category & Product</h2>

            <p className="text-sm text-gray-500">
              At least one of Category or Product must be selected.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:border-black"
              >
                <option value="">Select Category</option>

                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="mb-2 block text-sm font-medium">Product</label>

              <select
                name="product"
                value={form.product}
                onChange={handleChange}
                className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:border-black"
              >
                <option value="">Select Product</option>

                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        {/* -------------------------------- */}
        {/* Desktop Image */}
        {/* -------------------------------- */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Desktop Image</h2>

            <p className="text-sm text-gray-500">
              Recommended for desktop screens.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Image {!isEditMode && "*"}
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleDesktopImageChange}
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />

              <p className="mt-2 text-xs text-gray-500">
                Upload JPG, JPEG, PNG or WebP.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Alt Text</label>

              <input
                type="text"
                name="desktopImageAlt"
                value={form.desktopImageAlt}
                onChange={handleChange}
                placeholder="Describe desktop image"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>

          {desktopPreview && (
            <div className="relative mt-5 max-w-xl overflow-hidden rounded-xl border">
              <img
                src={desktopPreview}
                alt="Desktop preview"
                className="h-64 w-full object-cover"
              />

              <button
                type="button"
                onClick={removeDesktopImage}
                className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>
        {/* -------------------------------- */}
        {/* Mobile Image */}
        {/* -------------------------------- */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Mobile Image</h2>

            <p className="text-sm text-gray-500">
              Recommended for mobile screens.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Image {!isEditMode && "*"}
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleMobileImageChange}
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />

              <p className="mt-2 text-xs text-gray-500">
                Upload JPG, JPEG, PNG or WebP.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Alt Text</label>

              <input
                type="text"
                name="mobileImageAlt"
                value={form.mobileImageAlt}
                onChange={handleChange}
                placeholder="Describe mobile image"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>

          {mobilePreview && (
            <div className="relative mt-5 w-full max-w-xs overflow-hidden rounded-xl border">
              <img
                src={mobilePreview}
                alt="Mobile preview"
                className="h-96 w-full object-cover"
              />

              <button
                type="button"
                onClick={removeMobileImage}
                className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>
        {/* -------------------------------- */}
        {/* Publishing */}
        {/* -------------------------------- */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Publishing Settings</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Sort Order */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Sort Order
              </label>

              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:border-black"
              >
                <option value="DRAFT">Draft</option>

                <option value="PUBLISHED">Published</option>

                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Start */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Start Date
              </label>

              <input
                type="datetime-local"
                name="startAt"
                value={form.startAt}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            {/* End */}
            <div>
              <label className="mb-2 block text-sm font-medium">End Date</label>

              <input
                type="datetime-local"
                name="endAt"
                value={form.endAt}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            {/* Active */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">Active</span>
              </label>

              <p className="mt-1 text-xs text-gray-500">
                Controls whether this sleepwear section is active.
              </p>
            </div>
          </div>
        </section>
        {/* -------------------------------- */}
        {/* Actions */}
        {/* -------------------------------- */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/admin/home/sleepwear"
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? "Update Sleepwear" : "Create Sleepwear"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ---------------------------------------
// Convert ISO date to datetime-local value
// ---------------------------------------
const formatDateTimeLocal = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

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

export default AdminSleepwearEditForm;
