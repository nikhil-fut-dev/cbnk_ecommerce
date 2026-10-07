import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Power, Monitor, Smartphone } from "lucide-react";

import {
  getAdminHeroBanners,
  deleteAdminHeroBanner,
  toggleAdminHeroBannerStatus,
} from "../../services/adminHeroBannerApi";

const AdminHeroBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminHeroBanners();

      setBanners(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch hero banners:", error);

      setError(
        error?.response?.data?.message || "Failed to load hero banners.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      setActionLoading(id);

      await toggleAdminHeroBannerStatus(id);

      await fetchBanners();
    } catch (error) {
      console.error("Failed to toggle hero banner:", error);

      alert(
        error?.response?.data?.message || "Failed to update banner status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this hero banner?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);

      await deleteAdminHeroBanner(id);

      setBanners((prev) => prev.filter((banner) => banner._id !== id));
    } catch (error) {
      console.error("Failed to delete hero banner:", error);

      alert(error?.response?.data?.message || "Failed to delete hero banner.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">Loading hero banners...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Banners</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage homepage desktop and mobile hero banners.
          </p>
        </div>

        <Link
          to="/admin/home/hero-banners/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Hero Banner
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!error && banners.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Monitor size={40} className="mx-auto text-gray-400" />

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No hero banners found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first hero banner for the homepage.
          </p>

          <Link
            to="/admin/home/hero-banners/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={18} />
            Create Banner
          </Link>
        </div>
      )}

      {/* Banner Table */}
      {banners.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Banner
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Desktop
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Mobile
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {banners.map((banner) => {
                  const isActive = banner.isActive === true;
                  const isPublished = banner.status === "PUBLISHED";

                  const categoryName = banner.category?.name || "—";

                  const productName = banner.product?.name || "—";

                  return (
                    <tr
                      key={banner._id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Banner */}
                      <td className="px-5 py-4">
                        <div className="max-w-[220px]">
                          <p className="truncate font-semibold text-gray-900">
                            {banner.title}
                          </p>

                          {banner.smallText && (
                            <p className="mt-1 truncate text-xs text-gray-500">
                              {banner.smallText}
                            </p>
                          )}

                          {banner.ctaText && (
                            <span className="mt-2 inline-block rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                              CTA: {banner.ctaText}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Desktop */}
                      <td className="px-5 py-4">
                        {banner.desktopImage?.url ? (
                          <div className="relative h-16 w-28 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            <img
                              src={banner.desktopImage.url}
                              alt={banner.desktopImage.alt || banner.title}
                              className="h-full w-full object-cover"
                            />

                            <div className="absolute bottom-1 left-1 rounded bg-black/70 p-1 text-white">
                              <Monitor size={12} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No image
                          </span>
                        )}
                      </td>

                      {/* Mobile */}
                      <td className="px-5 py-4">
                        {banner.mobileImage?.url ? (
                          <div className="relative h-16 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            <img
                              src={banner.mobileImage.url}
                              alt={banner.mobileImage.alt || banner.title}
                              className="h-full w-full object-cover"
                            />

                            <div className="absolute bottom-1 left-1 rounded bg-black/70 p-1 text-white">
                              <Smartphone size={11} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No image
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700">
                          {categoryName}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700">
                          {productName}
                        </span>
                      </td>

                      {/* Sort Order */}
                      <td className="px-5 py-4">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700">
                          {banner.sortOrder ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              isPublished
                                ? "bg-green-100 text-green-700"
                                : banner.status === "INACTIVE"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {banner.status || "DRAFT"}
                          </span>

                          <div>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(banner._id)}
                              disabled={actionLoading === banner._id}
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                                isActive
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              <Power size={12} />

                              {isActive ? "Active" : "Inactive"}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/home/hero-banners/${banner._id}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            <Pencil size={15} />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(banner._id)}
                            disabled={actionLoading === banner._id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHeroBanners;
