import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  createAdminCoupon,
  getAdminCouponById,
  updateAdminCoupon,
} from "../../services/adminCouponApi";

import { getAdminCategories } from "../../services/adminCategoryApi";
import { getAdminProducts } from "../../services/adminProductApi";

const initialForm = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxDiscount: "",
  minimumOrderValue: "0",
  maximumOrderValue: "",
  usageLimit: "",
  perUserLimit: "1",
  startDate: "",
  expiryDate: "",
  applicableCategories: [],
  applicableProducts: [],
  isActive: true,
};

const AdminCouponForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(initialForm);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);

  const loadOptions = async () => {
    try {
      const [categoryResponse, productResponse] = await Promise.all([
        getAdminCategories({
          includeInactive: false,
          page: 1,
          limit: 100,
        }),
        getAdminProducts({
          status: "active",
          isDeleted: "false",
          page: 1,
          limit: 100,
        }),
      ]);

      if (categoryResponse.success) {
        setCategories(categoryResponse.data || []);
      }

      if (productResponse.success) {
        setProducts(productResponse.products || []);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load categories/products",
      );
    }
  };

  const loadCoupon = async () => {
    if (!id) return;

    try {
      setPageLoading(true);

      const response = await getAdminCouponById(id);

      if (!response.success) {
        toast.error(response.message || "Failed to load coupon");
        navigate("/admin/coupons");
        return;
      }

      const coupon = response.coupon;

      setForm({
        code: coupon.code || "",
        description: coupon.description || "",
        discountType: coupon.discountType || "PERCENTAGE",
        discountValue: coupon.discountValue ?? "",
        maxDiscount: coupon.maxDiscount ?? "",
        minimumOrderValue: coupon.minimumOrderValue ?? "0",
        maximumOrderValue: coupon.maximumOrderValue ?? "",
        usageLimit: coupon.usageLimit ?? "",
        perUserLimit: coupon.perUserLimit ?? "1",
        startDate: coupon.startDate
          ? new Date(coupon.startDate).toISOString().slice(0, 16)
          : "",
        expiryDate: coupon.expiryDate
          ? new Date(coupon.expiryDate).toISOString().slice(0, 16)
          : "",
        applicableCategories:
          coupon.applicableCategories?.map((category) => category._id) || [],
        applicableProducts:
          coupon.applicableProducts?.map((product) => product._id) || [],
        isActive: coupon.isActive ?? true,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load coupon");

      navigate("/admin/coupons");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadCoupon();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMultiSelect = (e, field) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );

    setForm((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  const validateForm = () => {
    if (!form.code.trim()) {
      toast.error("Coupon code is required");
      return false;
    }

    if (!form.discountValue || Number(form.discountValue) <= 0) {
      toast.error("Discount value must be greater than 0");
      return false;
    }

    if (
      form.discountType === "PERCENTAGE" &&
      Number(form.discountValue) > 100
    ) {
      toast.error("Percentage discount cannot exceed 100%");
      return false;
    }

    if (!form.startDate || !form.expiryDate) {
      toast.error("Start date and expiry date are required");
      return false;
    }

    if (new Date(form.expiryDate) <= new Date(form.startDate)) {
      toast.error("Expiry date must be after start date");
      return false;
    }

    if (form.perUserLimit && Number(form.perUserLimit) < 1) {
      toast.error("Per-user limit must be at least 1");
      return false;
    }

    if (form.minimumOrderValue && Number(form.minimumOrderValue) < 0) {
      toast.error("Minimum order value cannot be negative");
      return false;
    }

    if (form.maximumOrderValue && Number(form.maximumOrderValue) < 0) {
      toast.error("Maximum order value cannot be negative");
      return false;
    }

    if (
      form.maximumOrderValue &&
      Number(form.maximumOrderValue) < Number(form.minimumOrderValue || 0)
    ) {
      toast.error(
        "Maximum order value must be greater than minimum order value",
      );
      return false;
    }

    return true;
  };

  const buildPayload = () => {
    return {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),

      maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),

      minimumOrderValue:
        form.minimumOrderValue === "" ? 0 : Number(form.minimumOrderValue),

      maximumOrderValue:
        form.maximumOrderValue === "" ? null : Number(form.maximumOrderValue),

      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),

      perUserLimit: form.perUserLimit === "" ? 1 : Number(form.perUserLimit),

      startDate: new Date(form.startDate).toISOString(),
      expiryDate: new Date(form.expiryDate).toISOString(),

      applicableCategories: form.applicableCategories,
      applicableProducts: form.applicableProducts,

      isActive: form.isActive,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = buildPayload();

      const response = isEditMode
        ? await updateAdminCoupon(id, payload)
        : await createAdminCoupon(payload);

      if (!response.success) {
        toast.error(
          response.message ||
            `Failed to ${isEditMode ? "update" : "create"} coupon`,
        );
        return;
      }

      toast.success(
        response.message ||
          `Coupon ${isEditMode ? "updated" : "created"} successfully`,
      );

      navigate("/admin/coupons");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} coupon`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">Loading coupon...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/admin/coupons")}
            className="mb-4 text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            ← Back to Coupons
          </button>

          <h1 className="text-2xl font-bold text-neutral-900">
            {isEditMode ? "Edit Coupon" : "Create Coupon"}
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            {isEditMode
              ? "Update coupon settings and restrictions."
              : "Create a new discount coupon for customers."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-neutral-900">
              Basic Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Coupon Code *
                </label>

                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="WELCOME10"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Status
                </label>

                <label className="flex h-11 cursor-pointer items-center gap-3 rounded-lg border border-neutral-300 px-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />

                  <span className="text-sm text-neutral-700">
                    Coupon is active
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="10% discount for new customers"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
              </div>
            </div>
          </section>

          {/* Discount */}
          <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-neutral-900">
              Discount
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Discount Type *
                </label>

                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                >
                  <option value="PERCENTAGE">Percentage</option>

                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Discount Value *
                </label>

                <input
                  type="number"
                  name="discountValue"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={handleChange}
                  placeholder={
                    form.discountType === "PERCENTAGE" ? "10" : "500"
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Max Discount
                </label>

                <input
                  type="number"
                  name="maxDiscount"
                  min="0"
                  step="0.01"
                  value={form.maxDiscount}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
              </div>
            </div>
          </section>

          {/* Order Restrictions */}
          <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-neutral-900">
              Order Restrictions
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Minimum Order Value
                </label>

                <input
                  type="number"
                  name="minimumOrderValue"
                  min="0"
                  step="0.01"
                  value={form.minimumOrderValue}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Maximum Order Value
                </label>

                <input
                  type="number"
                  name="maximumOrderValue"
                  min="0"
                  step="0.01"
                  value={form.maximumOrderValue}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
              </div>
            </div>
          </section>

          {/* Usage */}
          <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-neutral-900">
              Usage Limits
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Total Usage Limit
                </label>

                <input
                  type="number"
                  name="usageLimit"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Per User Limit
                </label>

                <input
                  type="number"
                  name="perUserLimit"
                  min="1"
                  step="1"
                  value={form.perUserLimit}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
              </div>
            </div>
          </section>

          {/* Dates */}
          <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-neutral-900">
              Validity
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Start Date & Time *
                </label>

                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Expiry Date & Time *
                </label>

                <input
                  type="datetime-local"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">
              Applicable Categories
            </h2>

            <p className="mb-4 text-sm text-neutral-500">
              Leave empty to make the coupon available for all categories.
            </p>

            <select
              multiple
              value={form.applicableCategories}
              onChange={(e) => handleMultiSelect(e, "applicableCategories")}
              className="min-h-40 w-full rounded-lg border border-neutral-300 bg-white p-2 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
            >
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-neutral-400">
              Hold Ctrl/Cmd to select multiple categories.
            </p>
          </section>

          {/* Products */}
          <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-neutral-900">
              Applicable Products
            </h2>

            <p className="mb-4 text-sm text-neutral-500">
              Leave empty to make the coupon available for all products.
            </p>

            <select
              multiple
              value={form.applicableProducts}
              onChange={(e) => handleMultiSelect(e, "applicableProducts")}
              className="min-h-48 w-full rounded-lg border border-neutral-300 bg-white p-2 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
            >
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                  {product.SKU ? ` — ${product.SKU}` : ""}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-neutral-400">
              Hold Ctrl/Cmd to select multiple products.
            </p>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate("/admin/coupons")}
              className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Coupon"
                  : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCouponForm;
