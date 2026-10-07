import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  createAdminPromotionalTicker,
  getAdminPromotionalTickerById,
  updateAdminPromotionalTicker,
} from "../../services/adminPromotionalTickerApi";

const initialForm = {
  text: "",
  couponCode: "",
  sortOrder: 0,
  isActive: true,
  status: "DRAFT",
  startAt: "",
  endAt: "",
};

const AdminPromotionalTickerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id && id !== "new");

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // FETCH SINGLE TICKER
  // ======================================================

  const fetchTicker = async () => {
    if (!isEditMode) {
      return;
    }

    try {
      setFetching(true);
      setError("");

      const response = await getAdminPromotionalTickerById(id);

      const ticker = response?.data;

      if (!ticker) {
        setError("Promotional ticker not found.");
        return;
      }

      setForm({
        text: ticker.text || "",
        couponCode: ticker.couponCode || "",
        sortOrder: ticker.sortOrder ?? 0,
        isActive: ticker.isActive ?? true,
        status: ticker.status || "DRAFT",
        startAt: ticker.startAt ? formatDateTimeLocal(ticker.startAt) : "",
        endAt: ticker.endAt ? formatDateTimeLocal(ticker.endAt) : "",
      });
    } catch (error) {
      console.error("Fetch promotional ticker error:", error);

      setError(
        error?.response?.data?.message || "Failed to load promotional ticker.",
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTicker();
  }, [id]);

  // ======================================================
  // DATE FORMAT
  // ======================================================

  const formatDateTimeLocal = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ======================================================
  // INPUT HANDLER
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // BOOLEAN HANDLER
  // ======================================================

  const handleActiveChange = (event) => {
    setForm((previous) => ({
      ...previous,
      isActive: event.target.checked,
    }));
  };

  // ======================================================
  // VALIDATION
  // ======================================================

  const validateForm = () => {
    if (!form.text.trim()) {
      return "Promotional text is required.";
    }

    if (form.text.trim().length > 250) {
      return "Promotional text cannot exceed 250 characters.";
    }

    if (form.couponCode.trim().length > 50) {
      return "Coupon code cannot exceed 50 characters.";
    }

    if (
      form.startAt &&
      form.endAt &&
      new Date(form.startAt) >= new Date(form.endAt)
    ) {
      return "End date must be after start date.";
    }

    return "";
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        text: form.text.trim(),
        couponCode: form.couponCode.trim().toUpperCase(),
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
        status: form.status,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
        endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
      };

      if (isEditMode) {
        await updateAdminPromotionalTicker(id, payload);

        setSuccess("Promotional ticker updated successfully.");
      } else {
        await createAdminPromotionalTicker(payload);

        setSuccess("Promotional ticker created successfully.");
      }

      setTimeout(() => {
        navigate("/admin/home/promotional-ticker");
      }, 700);
    } catch (error) {
      console.error("Save promotional ticker error:", error);

      setError(
        error?.response?.data?.message || "Failed to save promotional ticker.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCHING
  // ======================================================

  if (fetching) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading promotional ticker...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ==================== HEADER ==================== */}

      <div>
        <Link
          to="/admin/home/promotional-ticker"
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Back to Promotional Tickers
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {isEditMode ? "Edit Promotional Ticker" : "Create Promotional Ticker"}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Configure the promotional message displayed on the customer homepage.
        </p>
      </div>

      {/* ==================== ERROR ==================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==================== SUCCESS ==================== */}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ==================== FORM ==================== */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ==================== CONTENT ==================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Content</h2>

          <div className="mt-5 space-y-5">
            {/* TEXT */}

            <div>
              <label
                htmlFor="text"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Promotional Text
              </label>

              <textarea
                id="text"
                name="text"
                value={form.text}
                onChange={handleChange}
                rows={3}
                maxLength={250}
                placeholder="Flat ₹300 off on ₹1999"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />

              <p className="mt-1 text-xs text-gray-400">
                {form.text.length}/250 characters
              </p>
            </div>

            {/* COUPON */}

            <div>
              <label
                htmlFor="couponCode"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Coupon Code
              </label>

              <input
                id="couponCode"
                name="couponCode"
                value={form.couponCode}
                onChange={handleChange}
                maxLength={50}
                placeholder="CBNK300"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm uppercase outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />

              <p className="mt-1 text-xs text-gray-400">Optional</p>
            </div>
          </div>
        </div>

        {/* ==================== DISPLAY ==================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Display Settings
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {/* SORT ORDER */}

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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            {/* STATUS */}

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
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              >
                <option value="DRAFT">Draft</option>

                <option value="PUBLISHED">Published</option>

                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* ACTIVE */}

          <label className="mt-5 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={handleActiveChange}
              className="h-4 w-4 rounded border-gray-300"
            />

            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>

        {/* ==================== SCHEDULE ==================== */}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>

          <p className="mt-1 text-sm text-gray-500">
            Optional. Leave empty to display without a scheduled time window.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {/* START */}

            <div>
              <label
                htmlFor="startAt"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>

              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                value={form.startAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            {/* END */}

            <div>
              <label
                htmlFor="endAt"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                End Date
              </label>

              <input
                id="endAt"
                name="endAt"
                type="datetime-local"
                value={form.endAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        {/* ==================== ACTIONS ==================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/home/promotional-ticker"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : isEditMode
                ? "Update Ticker"
                : "Create Ticker"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPromotionalTickerForm;
