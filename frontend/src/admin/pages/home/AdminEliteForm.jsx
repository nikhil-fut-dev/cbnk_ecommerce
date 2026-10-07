import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";

import {
  createAdminCBNKElite,
  getAdminCBNKEliteById,
  updateAdminCBNKElite,
} from "../../services/adminEliteApi";

const createEmptyBenefit = () => ({
  title: "",
  description: "",
  icon: "",
  sortOrder: 0,
});

const initialForm = {
  title: "",
  subtitle: "",
  description: "",

  benefits: [createEmptyBenefit()],

  originalPrice: "",
  sellingPrice: "",
  validityMonths: 12,

  taxText: "Inclusive of all taxes",
  validityText: "",

  logo: {
    url: "/logo.png",
    publicId: "",
    alt: "CBNK",
  },

  ctaText: "Join Elite",
  ctaLink: "",

  isActive: true,
  status: "DRAFT",

  startAt: "",
  endAt: "",
};

const toDateTimeLocal = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
};

const toISOStringOrNull = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const AdminEliteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH SINGLE ELITE
  // =========================================================

  useEffect(() => {
    if (!isEditMode) return;

    const fetchElite = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminCBNKEliteById(id);
        const elite = response?.elite;

        if (!elite) {
          throw new Error("CBNK Elite not found");
        }

        setForm({
          title: elite.title || "",
          subtitle: elite.subtitle || "",
          description: elite.description || "",

          benefits:
            Array.isArray(elite.benefits) && elite.benefits.length > 0
              ? elite.benefits.map((benefit) => ({
                  title: benefit.title || "",
                  description: benefit.description || "",
                  icon: benefit.icon || "",
                  sortOrder: benefit.sortOrder ?? 0,
                }))
              : [createEmptyBenefit()],

          originalPrice: elite.originalPrice ?? "",
          sellingPrice: elite.sellingPrice ?? "",
          validityMonths: elite.validityMonths ?? 12,

          taxText: elite.taxText || "Inclusive of all taxes",

          validityText: elite.validityText || "",

          logo: {
            url: elite.logo?.url || "/logo.png",
            publicId: elite.logo?.publicId || "",
            alt: elite.logo?.alt || "CBNK",
          },

          ctaText: elite.ctaText || "Join Elite",
          ctaLink: elite.ctaLink || "",

          isActive: elite.isActive ?? true,
          status: elite.status || "DRAFT",

          startAt: toDateTimeLocal(elite.startAt),
          endAt: toDateTimeLocal(elite.endAt),
        });
      } catch (error) {
        console.error("Failed to fetch CBNK Elite:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch CBNK Elite",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchElite();
  }, [id, isEditMode]);

  // =========================================================
  // BASIC FIELD CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // LOGO FIELD CHANGE
  // =========================================================

  const handleLogoChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      logo: {
        ...prev.logo,
        [name]: value,
      },
    }));
  };

  // =========================================================
  // BENEFIT CHANGE
  // =========================================================

  const handleBenefitChange = (index, field, value) => {
    setForm((prev) => {
      const benefits = [...prev.benefits];

      benefits[index] = {
        ...benefits[index],
        [field]: value,
      };

      return {
        ...prev,
        benefits,
      };
    });
  };

  // =========================================================
  // ADD BENEFIT
  // =========================================================

  const addBenefit = () => {
    setForm((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          ...createEmptyBenefit(),
          sortOrder: prev.benefits.length,
        },
      ],
    }));
  };

  // =========================================================
  // REMOVE BENEFIT
  // =========================================================

  const removeBenefit = (index) => {
    setForm((prev) => {
      if (prev.benefits.length === 1) {
        return prev;
      }

      return {
        ...prev,
        benefits: prev.benefits.filter(
          (_, benefitIndex) => benefitIndex !== index,
        ),
      };
    });
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Title is required";
    }

    if (form.title.trim().length > 150) {
      return "Title cannot exceed 150 characters";
    }

    if (form.subtitle.trim().length > 250) {
      return "Subtitle cannot exceed 250 characters";
    }

    if (form.description.trim().length > 500) {
      return "Description cannot exceed 500 characters";
    }

    if (form.originalPrice === "" || form.originalPrice === null) {
      return "Original price is required";
    }

    if (form.sellingPrice === "" || form.sellingPrice === null) {
      return "Selling price is required";
    }

    const originalPrice = Number(form.originalPrice);
    const sellingPrice = Number(form.sellingPrice);
    const validityMonths = Number(form.validityMonths);

    if (Number.isNaN(originalPrice) || originalPrice < 0) {
      return "Original price must be a valid positive number";
    }

    if (Number.isNaN(sellingPrice) || sellingPrice < 0) {
      return "Selling price must be a valid positive number";
    }

    if (Number.isNaN(validityMonths) || validityMonths < 1) {
      return "Validity must be at least 1 month";
    }

    if (form.taxText.trim().length > 100) {
      return "Tax text cannot exceed 100 characters";
    }

    if (form.validityText.trim().length > 100) {
      return "Validity text cannot exceed 100 characters";
    }

    if (form.ctaText.trim().length > 50) {
      return "CTA text cannot exceed 50 characters";
    }

    if (form.ctaLink.trim().length > 300) {
      return "CTA link cannot exceed 300 characters";
    }

    for (let index = 0; index < form.benefits.length; index++) {
      const benefit = form.benefits[index];

      if (!benefit.title.trim()) {
        return `Benefit ${index + 1} title is required`;
      }

      if (benefit.title.trim().length > 100) {
        return `Benefit ${index + 1} title cannot exceed 100 characters`;
      }

      if (benefit.description.trim().length > 250) {
        return `Benefit ${index + 1} description cannot exceed 250 characters`;
      }

      if (benefit.icon.trim().length > 100) {
        return `Benefit ${index + 1} icon cannot exceed 100 characters`;
      }
    }

    if (form.startAt && form.endAt) {
      const start = new Date(form.startAt);
      const end = new Date(form.endAt);

      if (end <= start) {
        return "End date must be later than start date";
      }
    }

    return "";
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),

        benefits: form.benefits.map((benefit) => ({
          title: benefit.title.trim(),
          description: benefit.description.trim(),
          icon: benefit.icon.trim(),
          sortOrder: Number(benefit.sortOrder) || 0,
        })),

        originalPrice: Number(form.originalPrice),
        sellingPrice: Number(form.sellingPrice),
        validityMonths: Number(form.validityMonths),

        taxText: form.taxText.trim() || "Inclusive of all taxes",

        validityText: form.validityText.trim(),

        logo: {
          url: form.logo.url.trim() || "/logo.png",
          publicId: form.logo.publicId.trim(),
          alt: form.logo.alt.trim() || "CBNK",
        },

        ctaText: form.ctaText.trim() || "Join Elite",

        ctaLink: form.ctaLink.trim(),

        isActive: form.isActive,
        status: form.status,

        startAt: toISOStringOrNull(form.startAt),
        endAt: toISOStringOrNull(form.endAt),
      };

      if (isEditMode) {
        await updateAdminCBNKElite(id, payload);
      } else {
        await createAdminCBNKElite(payload);
      }

      navigate("/admin/home/elite");
    } catch (error) {
      console.error("Failed to save CBNK Elite:", error);

      setError(error?.response?.data?.message || "Failed to save CBNK Elite");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading CBNK Elite...</p>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/home/elite"
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to CBNK Elite
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit CBNK Elite" : "Create CBNK Elite"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the CBNK Elite membership content.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Basic Information
          </h2>

          <div className="mt-5 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title *
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                placeholder="CBNK Elite Membership"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Subtitle
              </label>

              <input
                type="text"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                maxLength={250}
                placeholder="Premium benefits for CBNK members"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={500}
                rows={4}
                placeholder="Describe the CBNK Elite membership..."
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            PRICING
        =================================================== */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Pricing & Validity
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Original Price *
              </label>

              <input
                type="number"
                name="originalPrice"
                value={form.originalPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="999"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Selling Price *
              </label>

              <input
                type="number"
                name="sellingPrice"
                value={form.sellingPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="499"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Validity (Months) *
              </label>

              <input
                type="number"
                name="validityMonths"
                value={form.validityMonths}
                onChange={handleChange}
                min="1"
                step="1"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tax Text
              </label>

              <input
                type="text"
                name="taxText"
                value={form.taxText}
                onChange={handleChange}
                maxLength={100}
                placeholder="Inclusive of all taxes"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Validity Text
              </label>

              <input
                type="text"
                name="validityText"
                value={form.validityText}
                onChange={handleChange}
                maxLength={100}
                placeholder="Valid for 12 months"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            BENEFITS
        =================================================== */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Elite Benefits
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add the benefits customers receive with Elite.
              </p>
            </div>

            <button
              type="button"
              onClick={addBenefit}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Add Benefit
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {form.benefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">
                    Benefit {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    disabled={form.benefits.length === 1}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Remove benefit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Title *
                    </label>

                    <input
                      type="text"
                      value={benefit.title}
                      onChange={(event) =>
                        handleBenefitChange(index, "title", event.target.value)
                      }
                      maxLength={100}
                      placeholder="Free Shipping"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Icon
                    </label>

                    <input
                      type="text"
                      value={benefit.icon}
                      onChange={(event) =>
                        handleBenefitChange(index, "icon", event.target.value)
                      }
                      maxLength={100}
                      placeholder="truck"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Sort Order
                    </label>

                    <input
                      type="number"
                      value={benefit.sortOrder}
                      onChange={(event) =>
                        handleBenefitChange(
                          index,
                          "sortOrder",
                          event.target.value,
                        )
                      }
                      min="0"
                      step="1"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>

                    <textarea
                      value={benefit.description}
                      onChange={(event) =>
                        handleBenefitChange(
                          index,
                          "description",
                          event.target.value,
                        )
                      }
                      maxLength={250}
                      rows={3}
                      placeholder="Enjoy free shipping on eligible orders."
                      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            LOGO
        =================================================== */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Logo</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Logo URL
              </label>

              <input
                type="text"
                name="url"
                value={form.logo.url}
                onChange={handleLogoChange}
                placeholder="/logo.png"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Public ID
              </label>

              <input
                type="text"
                name="publicId"
                value={form.logo.publicId}
                onChange={handleLogoChange}
                placeholder="Cloudinary public ID"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Alt Text
              </label>

              <input
                type="text"
                name="alt"
                value={form.logo.alt}
                onChange={handleLogoChange}
                placeholder="CBNK"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            CTA
        =================================================== */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Call To Action
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                CTA Text
              </label>

              <input
                type="text"
                name="ctaText"
                value={form.ctaText}
                onChange={handleChange}
                maxLength={50}
                placeholder="Join Elite"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
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
                maxLength={300}
                placeholder="/elite"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            PUBLISHING
        =================================================== */}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Publishing</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-black"
              >
                <option value="DRAFT">DRAFT</option>

                <option value="PUBLISHED">PUBLISHED</option>

                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />

                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Start At
              </label>

              <input
                type="datetime-local"
                name="startAt"
                value={form.startAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                End At
              </label>

              <input
                type="datetime-local"
                name="endAt"
                value={form.endAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/home/elite"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {saving
              ? "Saving..."
              : isEditMode
                ? "Update Elite"
                : "Create Elite"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEliteForm;
