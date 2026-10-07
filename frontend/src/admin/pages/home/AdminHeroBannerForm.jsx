import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Upload,
  X,
} from "lucide-react";

import {
  createAdminHeroBanner,
  getAdminHeroBannerById,
  updateAdminHeroBanner,
} from "../../services/adminHeroBannerApi";

import { getAdminCategories } from "../../services/adminCategoryApi";
import { getAdminProducts } from "../../services/adminProductApi";

const AdminHeroBannerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [error, setError] = useState("");

  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");

  const [form, setForm] = useState({
    smallText: "",
    title: "",
    description: "",

    desktopImage: null,
    mobileImage: null,

    desktopAlt: "",
    mobileAlt: "",

    ctaText: "",
    ctaLink: "",

    category: "",
    product: "",

    sortOrder: 0,

    isActive: true,
    status: "DRAFT",

    startAt: "",
    endAt: "",
  });

  // =====================================================
  // LOAD CATEGORIES + PRODUCTS
  // =====================================================

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          getAdminCategories({
            includeInactive: true,
            page: 1,
            limit: 100,
          }),

          getAdminProducts({
            page: 1,
            limit: 100,
            sort: "newest",
          }),
        ]);

        /*
          Existing APIs ke response structure ko safely handle
          karne ke liye multiple possible array locations support
          kiye gaye hain.
        */

        const categoryData =
          categoryResponse?.data?.categories || categoryResponse?.data || [];

        const productData =
          productResponse?.data?.products || productResponse?.data || [];

        setCategories(Array.isArray(categoryData) ? categoryData : []);

        setProducts(Array.isArray(productData) ? productData : []);
      } catch (error) {
        console.error("Failed to load categories/products:", error);
      }
    };

    loadOptions();
  }, []);

  // =====================================================
  // LOAD EXISTING BANNER
  // =====================================================

  useEffect(() => {
    if (!isEditMode) return;

    const loadBanner = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminHeroBannerById(id);

        const banner = response?.data;

        if (!banner) {
          throw new Error("Hero banner not found.");
        }

        setForm({
          smallText: banner.smallText || "",
          title: banner.title || "",
          description: banner.description || "",

          desktopImage: null,
          mobileImage: null,

          desktopAlt: banner.desktopImage?.alt || "",
          mobileAlt: banner.mobileImage?.alt || "",

          ctaText: banner.ctaText || "",
          ctaLink: banner.ctaLink || "",

          category: banner.category?._id || banner.category || "",
          product: banner.product?._id || banner.product || "",

          sortOrder: banner.sortOrder ?? 0,

          isActive: banner.isActive ?? true,
          status: banner.status || "DRAFT",

          startAt: formatDateTimeLocal(banner.startAt),
          endAt: formatDateTimeLocal(banner.endAt),
        });

        setDesktopPreview(banner.desktopImage?.url || "");

        setMobilePreview(banner.mobileImage?.url || "");
      } catch (error) {
        console.error("Failed to load hero banner:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load hero banner.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadBanner();
  }, [id, isEditMode]);

  // =====================================================
  // DATE HELPER
  // =====================================================

  const formatDateTimeLocal = (value) => {
    if (!value) return "";

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
  // REMOVE DESKTOP SELECTED IMAGE
  // =====================================================

  const removeDesktopImage = () => {
    setForm((prev) => ({
      ...prev,
      desktopImage: null,
    }));

    /*
      Edit mode me agar existing image remove ki ja rahi hai,
      backend us image ko delete nahi karta.
      Isliye preview ko existing URL par rehne dena safer hai.
    */

    if (isEditMode) {
      return;
    }

    setDesktopPreview("");
  };

  // =====================================================
  // REMOVE MOBILE SELECTED IMAGE
  // =====================================================

  const removeMobileImage = () => {
    setForm((prev) => ({
      ...prev,
      mobileImage: null,
    }));

    if (isEditMode) {
      return;
    }

    setMobilePreview("");
  };

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Hero banner title is required.";
    }

    if (!isEditMode && !form.desktopImage) {
      return "Desktop image is required.";
    }

    if (!isEditMode && !form.mobileImage) {
      return "Mobile image is required.";
    }

    if (
      form.startAt &&
      form.endAt &&
      new Date(form.startAt) >= new Date(form.endAt)
    ) {
      return "End date/time must be after start date/time.";
    }

    return "";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        smallText: form.smallText,
        title: form.title,
        description: form.description,

        desktopImage: form.desktopImage,
        mobileImage: form.mobileImage,

        desktopAlt: form.desktopAlt,
        mobileAlt: form.mobileAlt,

        ctaText: form.ctaText,
        ctaLink: form.ctaLink,

        category: form.category,
        product: form.product,

        sortOrder: form.sortOrder,

        isActive: form.isActive,
        status: form.status,

        startAt: form.startAt ? new Date(form.startAt).toISOString() : "",

        endAt: form.endAt ? new Date(form.endAt).toISOString() : "",
      };

      if (isEditMode) {
        await updateAdminHeroBanner(id, payload);
      } else {
        await createAdminHeroBanner(payload);
      }

      navigate("/admin/home/hero-banners");
    } catch (error) {
      console.error("Failed to save hero banner:", error);

      setError(error?.response?.data?.message || "Failed to save hero banner.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CATEGORY OPTIONS
  // =====================================================

  const categoryOptions = useMemo(() => {
    return categories.filter((category) => category?._id);
  }, [categories]);

  // =====================================================
  // PRODUCT OPTIONS
  // =====================================================

  const productOptions = useMemo(() => {
    return products.filter((product) => product?._id);
  }, [products]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading hero banner...</p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/home/hero-banners"
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Hero Banners
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Hero Banner" : "Create Hero Banner"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage homepage desktop and mobile hero content.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Main text content displayed on the hero banner.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Small Text */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Small Text
              </label>

              <input
                type="text"
                name="smallText"
                value={form.smallText}
                onChange={handleChange}
                placeholder="Summer Collection"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="New Collection"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black"
              />
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
                rows={4}
                placeholder="Describe your collection..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            IMAGES
        ================================================= */}

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Banner Images
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload separate images for desktop and mobile devices.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* DESKTOP */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Monitor size={18} />
                <h3 className="text-sm font-semibold text-gray-900">
                  Desktop Image
                  {!isEditMode && <span className="ml-1 text-red-500">*</span>}
                </h3>
              </div>

              <ImageUploadBox
                preview={desktopPreview}
                file={form.desktopImage}
                onChange={handleDesktopImageChange}
                onRemove={removeDesktopImage}
                aspect="desktop"
              />

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Desktop Alt Text
                </label>

                <input
                  type="text"
                  name="desktopAlt"
                  value={form.desktopAlt}
                  onChange={handleChange}
                  placeholder="Desktop banner image"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            {/* MOBILE */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Smartphone size={18} />
                <h3 className="text-sm font-semibold text-gray-900">
                  Mobile Image
                  {!isEditMode && <span className="ml-1 text-red-500">*</span>}
                </h3>
              </div>

              <ImageUploadBox
                preview={mobilePreview}
                file={form.mobileImage}
                onChange={handleMobileImageChange}
                onRemove={removeMobileImage}
                aspect="mobile"
              />

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mobile Alt Text
                </label>

                <input
                  type="text"
                  name="mobileAlt"
                  value={form.mobileAlt}
                  onChange={handleChange}
                  placeholder="Mobile banner image"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            CTA
        ================================================= */}

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Call To Action
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                CTA Text
              </label>

              <input
                type="text"
                name="ctaText"
                value={form.ctaText}
                onChange={handleChange}
                placeholder="Shop Now"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                CTA Link
              </label>

              <input
                type="text"
                name="ctaLink"
                value={form.ctaLink}
                onChange={handleChange}
                placeholder="/products"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            CATEGORY / PRODUCT
        ================================================= */}

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Targeting</h2>

            <p className="mt-1 text-sm text-gray-500">
              Optionally connect this banner to a category or product.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
              >
                <option value="">No Category</option>

                {categoryOptions.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product
              </label>

              <select
                name="product"
                value={form.product}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
              >
                <option value="">No Product</option>

                {productOptions.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* =================================================
            PUBLISHING
        ================================================= */}

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Publishing & Schedule
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
              >
                <option value="DRAFT">DRAFT</option>

                <option value="PUBLISHED">PUBLISHED</option>

                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            {/* Start */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Start At
              </label>

              <input
                type="datetime-local"
                name="startAt"
                value={form.startAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>

            {/* End */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                End At
              </label>

              <input
                type="datetime-local"
                name="endAt"
                value={form.endAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Active */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
              />

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Active Banner
                </p>

                <p className="text-xs text-gray-500">
                  Enable this banner on the homepage.
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/home/hero-banners"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : isEditMode
                ? "Update Hero Banner"
                : "Create Hero Banner"}
          </button>
        </div>
      </form>
    </div>
  );
};

// =========================================================
// IMAGE UPLOAD COMPONENT
// =========================================================

const ImageUploadBox = ({ preview, file, onChange, onRemove, aspect }) => {
  const isMobile = aspect === "mobile";

  return (
    <div>
      {preview ? (
        <div
          className={`relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 ${
            isMobile ? "mx-auto h-[320px] w-[180px]" : "h-[220px] w-full"
          }`}
        >
          <img
            src={preview}
            alt="Banner preview"
            className="h-full w-full object-cover"
          />

          <button
            type="button"
            onClick={onRemove}
            className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
          >
            <X size={16} />
          </button>

          {file && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2 text-xs text-white">
              {file.name}
            </div>
          )}
        </div>
      ) : (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-center transition hover:border-gray-500 hover:bg-gray-100 ${
            isMobile ? "mx-auto h-[320px] w-[180px]" : "h-[220px] w-full"
          }`}
        >
          <Upload size={28} className="text-gray-400" />

          <span className="mt-3 text-sm font-medium text-gray-700">
            Upload Image
          </span>

          <span className="mt-1 text-xs text-gray-500">Click to select</span>

          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
          />
        </label>
      )}

      {preview && (
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <ImageIcon size={15} />
          Replace Image
          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};

export default AdminHeroBannerForm;
