import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save, X } from "lucide-react";

import {
  getAdminPoloShopById,
  createAdminPoloShop,
  updateAdminPoloShop,
} from "../../services/adminPoloShopApi";

import { getAdminCategories } from "../../services/adminCategoryApi";
import { getAdminProducts } from "../../services/adminProductApi";

const AdminPoloShopForm = () => {
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

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

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

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

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

  // =====================================================
  // DATE FORMATTER
  // =====================================================

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

  // =====================================================
  // LOAD EXISTING POLO SHOP
  // =====================================================

  const loadPoloShop = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await getAdminPoloShopById(id);

      const poloShop =
        response?.poloShop || response?.data?.poloShop || response?.data;

      if (!poloShop) {
        throw new Error("Polo Shop data not found");
      }

      setForm({
        smallText: poloShop.smallText || "",

        title: poloShop.title || "",

        priceText: poloShop.priceText || "",

        category: poloShop.category?._id || poloShop.category || "",

        product: poloShop.product?._id || poloShop.product || "",

        desktopImage: null,

        desktopImageAlt: poloShop.desktopImage?.alt || "",

        mobileImage: null,

        mobileImageAlt: poloShop.mobileImage?.alt || "",

        sortOrder: poloShop.sortOrder ?? 0,

        isActive: poloShop.isActive ?? true,

        status: poloShop.status || "DRAFT",

        startAt: formatDateTimeLocal(poloShop.startAt),

        endAt: formatDateTimeLocal(poloShop.endAt),

        ctaText: poloShop?.cta?.text || "",

        ctaLink: poloShop?.cta?.link || "",

        ctaOpenInNewTab: poloShop?.cta?.openInNewTab ?? false,
      });

      setDesktopPreview(poloShop.desktopImage?.url || "");

      setMobilePreview(poloShop.mobileImage?.url || "");
    } catch (err) {
      console.error("Polo Shop loading error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load Polo Shop",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([loadCategories(), loadProducts()]);

      if (isEditMode) {
        await loadPoloShop();
      }
    };

    initialize();
  }, [id]);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // DESKTOP IMAGE
  // =====================================================

  const handleDesktopImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      desktopImage: file,
    }));

    setDesktopPreview(URL.createObjectURL(file));
  };

  // =====================================================
  // MOBILE IMAGE
  // =====================================================

  const handleMobileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      mobileImage: file,
    }));

    setMobilePreview(URL.createObjectURL(file));
  };

  // =====================================================
  // REMOVE DESKTOP PREVIEW
  // =====================================================

  const removeDesktopImage = () => {
    setForm((prev) => ({
      ...prev,
      desktopImage: null,
    }));

    setDesktopPreview("");
  };

  // =====================================================
  // REMOVE MOBILE PREVIEW
  // =====================================================

  const removeMobileImage = () => {
    setForm((prev) => ({
      ...prev,
      mobileImage: null,
    }));

    setMobilePreview("");
  };

  // =====================================================
  // ISO DATE
  // =====================================================

  const toISOStringOrNull = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // TITLE
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    // CATEGORY OR PRODUCT
    if (!form.category && !form.product) {
      setError("Please select at least a category or a product.");
      return;
    }

    // CREATE IMAGES
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

    // DATE VALIDATION
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

      // Add images only if selected
      if (form.desktopImage) {
        payload.desktopImage = form.desktopImage;
      }

      if (form.mobileImage) {
        payload.mobileImage = form.mobileImage;
      }

      if (isEditMode) {
        await updateAdminPoloShop(id, payload);

        setSuccess("Polo Shop updated successfully.");
      } else {
        await createAdminPoloShop(payload);

        setSuccess("Polo Shop created successfully.");
      }

      setTimeout(() => {
        navigate("/admin/home/polo-shop");
      }, 700);
    } catch (err) {
      console.error("Polo Shop submit error:", err);

      setError(err?.response?.data?.message || "Failed to save Polo Shop.");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HEADER */}

      <div>
        <Link
          to="/admin/home/polo-shop"
          className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Polo Shop
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Edit Polo Shop" : "Create Polo Shop"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage the Polo Shop section displayed on the customer home page.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================================================= */}
        {/* BASIC INFORMATION */}
        {/* ================================================= */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <p className="text-sm text-gray-500">
              Main content displayed inside the Polo Shop banner.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* SMALL TEXT */}

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
                placeholder="Example: The Polo Shop"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            {/* PRICE */}

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
                placeholder="Example: Starting at ₹399"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            {/* TITLE */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Title *</label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                required
                placeholder="Example: POLOS FOR EVERY OCCASION"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* CTA SETTINGS */}
        {/* ================================================= */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">CTA Settings</h2>

            <p className="text-sm text-gray-500">
              Configure where customers go when they click the Polo Shop
              section.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* CTA TEXT */}
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

            {/* CTA LINK */}
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

            {/* OPEN IN NEW TAB */}
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

        {/* ================================================= */}
        {/* CATEGORY / PRODUCT */}
        {/* ================================================= */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Category & Product</h2>

            <p className="text-sm text-gray-500">
              At least one of Category or Product must be selected.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* CATEGORY */}

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

            {/* PRODUCT */}

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
        {/* ================================================= */}
        {/* DESKTOP IMAGE */}
        {/* ================================================= */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Desktop Image</h2>

            <p className="text-sm text-gray-500">
              Banner image for desktop and larger screens.
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
            <div className="relative mt-5 overflow-hidden rounded-xl border">
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
        {/* ================================================= */}
        {/* MOBILE IMAGE */}
        {/* ================================================= */}
        <section className="rounded-xl border bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Mobile Image</h2>

            <p className="text-sm text-gray-500">
              Banner image for mobile screens.
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
            <div className="relative mt-5 max-w-md overflow-hidden rounded-xl border">
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
        {/* ================================================= */}
        {/* PUBLISHING */}
        {/* ================================================= */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Publishing Settings</h2>

          <div className="grid gap-5 md:grid-cols-2">
            {/* SORT ORDER */}

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

            {/* STATUS */}

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

            {/* START */}

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

            {/* END */}

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

            {/* ACTIVE */}

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
            </div>
          </div>
        </section>
        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}
        <div className="flex justify-end gap-3">
          <Link
            to="/admin/home/polo-shop"
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
                {isEditMode ? "Update Polo Shop" : "Create Polo Shop"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPoloShopForm;
