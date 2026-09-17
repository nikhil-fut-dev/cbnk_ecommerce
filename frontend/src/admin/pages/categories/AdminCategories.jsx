import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getAdminCategories,
  toggleAdminCategoryStatus,
  deleteAdminCategory,
} from "../../services/adminCategoryApi";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getAdminCategories({
        includeInactive,
        search,
        page,
        limit: pagination.limit,
      });

      if (response.success) {
        setCategories(response.data || []);

        setPagination(
          response.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        );
      } else {
        toast.error(response.message || "Unable to load categories");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1);
  }, [search, includeInactive]);

  const handlePrevious = () => {
    if (pagination.hasPrev && !loading) {
      fetchCategories(pagination.page - 1);
    }
  };

  const handleNext = () => {
    if (pagination.hasNext && !loading) {
      fetchCategories(pagination.page + 1);
    }
  };

  const handleToggleStatus = async (category) => {
    const action = category.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await toggleAdminCategoryStatus(category._id);

      if (response.success) {
        toast.success(response.message || "Category status updated");

        await fetchCategories(pagination.page);
      } else {
        toast.error(response.message || "Unable to update category status");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update category status",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await deleteAdminCategory(category._id);

      if (response.success) {
        toast.success(response.message || "Category deleted successfully");

        /*
          Backend performs a soft delete:
          isActive becomes false.
        */
        await fetchCategories(pagination.page);
      } else {
        toast.error(response.message || "Unable to delete category");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete category");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading && categories.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />

          <p className="mt-4 text-sm text-neutral-500">Loading categories...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Categories</h1>

            <p className="mt-2 text-neutral-600">
              Manage categories and subcategories in your CBNK store.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fetchCategories(pagination.page)}
              disabled={loading}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to="/admin/categories/new"
              className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              + Add Category
            </Link>
          </div>
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Search Category
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or slug..."
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Category Status
              </label>

              <select
                value={includeInactive ? "all" : "active"}
                onChange={(event) =>
                  setIncludeInactive(event.target.value === "all")
                }
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
              >
                <option value="all">All Categories</option>

                <option value="active">Active Only</option>
              </select>
            </div>
          </div>
        </section>

        {/* Count */}
        <div className="mb-4">
          <p className="text-sm text-neutral-500">
            {pagination.total} categor
            {pagination.total !== 1 ? "ies" : "y"} found
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {categories.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-xl font-semibold text-neutral-900">
                No categories found
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                Try changing your search or create a new category.
              </p>

              <Link
                to="/admin/categories/new"
                className="mt-5 inline-flex rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Add Category
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
                      <th className="px-6 py-4 font-medium">Category</th>

                      <th className="px-6 py-4 font-medium">Slug</th>

                      <th className="px-6 py-4 font-medium">Parent</th>

                      <th className="px-6 py-4 font-medium">Sort Order</th>

                      <th className="px-6 py-4 font-medium">Status</th>

                      <th className="px-6 py-4 font-medium">Created</th>

                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {categories.map((category) => (
                      <tr
                        key={category._id}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                      >
                        {/* Category */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-neutral-900">
                                {category.name}
                              </p>

                              <p className="mt-1 max-w-xs truncate text-sm text-neutral-500">
                                {category.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                            /{category.slug}
                          </span>
                        </td>

                        {/* Parent */}
                        <td className="px-6 py-5 text-sm text-neutral-600">
                          {category.parentCategory?.name || "Root Category"}
                        </td>

                        {/* Sort */}
                        <td className="px-6 py-5 text-sm font-medium text-neutral-700">
                          {category.sortOrder ?? 0}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              category.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {category.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-6 py-5 text-sm text-neutral-600">
                          {formatDate(category.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/admin/categories/${category._id}/edit`}
                              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(category)}
                              disabled={loading}
                              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {category.isActive ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(category)}
                              disabled={loading}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="flex flex-col gap-4 border-t border-neutral-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-500">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={!pagination.hasPrev || loading}
                    className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!pagination.hasNext || loading}
                    className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default AdminCategories;
