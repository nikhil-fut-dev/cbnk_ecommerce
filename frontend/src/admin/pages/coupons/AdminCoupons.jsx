import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAdminCoupons,
  toggleAdminCouponStatus,
  deleteAdminCoupon,
} from "../../services/adminCouponApi";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const response = await getAdminCoupons({
        search,
        status,
        page,
        limit: 20,
      });

      if (response.success) {
        setCoupons(response.coupons || []);
        setPagination(response.pagination || null);
      } else {
        toast.error(response.message || "Failed to load coupons");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [search, status, page]);

  const handleStatusToggle = async (couponId) => {
    try {
      setActionLoading(couponId);

      const response = await toggleAdminCouponStatus(couponId);

      if (response.success) {
        toast.success(response.message || "Coupon status updated");
        fetchCoupons();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update coupon status",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (couponId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(couponId);

      const response = await deleteAdminCoupon(couponId);

      if (response.success) {
        toast.success(response.message || "Coupon deleted");

        if (coupons.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        } else {
          fetchCoupons();
        }
      } else {
        toast.error(response.message || "Failed to delete coupon");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}%`;
    }

    return `₹${coupon.discountValue}`;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Coupons</h1>

            <p className="mt-1 text-sm text-neutral-500">
              Manage discount coupons and promotional offers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/admin/coupons/new";
            }}
            className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            + Create Coupon
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            {/* Search */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search coupon code or description..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <p className="text-sm text-neutral-500">Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
              <h2 className="text-lg font-semibold text-neutral-800">
                No coupons found
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-neutral-200 bg-neutral-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Coupon
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Discount
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Validity
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Usage
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {coupons.map((coupon) => (
                      <tr
                        key={coupon._id}
                        className="transition hover:bg-neutral-50"
                      >
                        {/* Coupon */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-neutral-900">
                              {coupon.code}
                            </p>

                            <p className="mt-1 max-w-xs text-sm text-neutral-500">
                              {coupon.description || "No description"}
                            </p>
                          </div>
                        </td>

                        {/* Discount */}
                        <td className="px-5 py-4">
                          <span className="font-semibold text-neutral-900">
                            {formatDiscount(coupon)}
                          </span>

                          <p className="mt-1 text-xs text-neutral-500">
                            {coupon.discountType}
                          </p>
                        </td>

                        {/* Validity */}
                        <td className="px-5 py-4 text-sm text-neutral-600">
                          <p>{formatDate(coupon.startDate)}</p>

                          <p className="mt-1 text-xs text-neutral-400">
                            to {formatDate(coupon.expiryDate)}
                          </p>
                        </td>

                        {/* Usage */}
                        <td className="px-5 py-4 text-sm text-neutral-600">
                          <p>
                            Used:{" "}
                            <span className="font-medium">
                              {coupon.usedCount ?? 0}
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-neutral-400">
                            Limit: {coupon.usageLimit ?? "Unlimited"}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            disabled={actionLoading === coupon._id}
                            onClick={() => handleStatusToggle(coupon._id)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              coupon.isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                          >
                            {actionLoading === coupon._id
                              ? "Updating..."
                              : coupon.isActive
                                ? "Active"
                                : "Inactive"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                (window.location.href = `/admin/coupons/${coupon._id}/edit`)
                              }
                              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={actionLoading === coupon._id}
                              onClick={() => handleDelete(coupon._id)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-4">
                  <p className="text-sm text-neutral-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!pagination.hasPrev}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={!pagination.hasNext}
                      onClick={() => setPage((prev) => prev + 1)}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
