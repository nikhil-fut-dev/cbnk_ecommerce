import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  getAdminProducts,
  toggleAdminProductStatus,
} from "../../services/adminProductApi";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalProducts: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isDeleted, setIsDeleted] = useState("");
  const [sort, setSort] = useState("newest");

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getAdminProducts({
        search,
        status,
        isDeleted,
        page,
        limit: pagination.limit,
        sort,
      });

      if (response.success) {
        setProducts(response.products || []);
        setPagination(response.pagination);
      } else {
        toast.error(response.message || "Unable to load products");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to load admin products";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [search, status, isDeleted, sort]);

  const handlePrevious = () => {
    if (pagination.hasPrev) {
      fetchProducts(pagination.page - 1);
    }
  };

  const handleNext = () => {
    if (pagination.hasNext) {
      fetchProducts(pagination.page + 1);
    }
  };

  const handleToggleStatus = async (product) => {
    const action = product.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await toggleAdminProductStatus(product._id);

      if (response.success) {
        toast.success(response.message || "Product status updated");

        await fetchProducts(pagination.page);
      } else {
        toast.error(response.message || "Unable to update product status");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to update product status";

      toast.error(message);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setIsDeleted("");
    setSort("newest");
  };

  if (loading && products.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />

          <p className="mt-4 text-sm text-neutral-500">Loading products...</p>
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
            <h1 className="text-3xl font-bold text-neutral-900">Products</h1>

            <p className="mt-2 text-neutral-600">
              Manage products in your CBNK store.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchProducts(pagination.page)}
            disabled={loading}
            className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, SKU or brand..."
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Sort
              </label>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            {/* Deleted */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Deleted Products
              </label>

              <select
                value={isDeleted}
                onChange={(event) => setIsDeleted(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
              >
                <option value="">All Products</option>
                <option value="false">Not Deleted</option>
                <option value="true">Deleted</option>
              </select>
            </div>
          </div>

          {/* Reset */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Reset Filters
            </button>
          </div>
        </section>

        {/* Product count */}
        <div className="mb-4">
          <p className="text-sm text-neutral-500">
            {pagination.totalProducts} product
            {pagination.totalProducts !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Product Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {products.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-xl font-semibold text-neutral-900">
                No products found
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
                      <th className="px-6 py-4 font-medium">Product</th>

                      <th className="px-6 py-4 font-medium">SKU</th>

                      <th className="px-6 py-4 font-medium">Category</th>

                      <th className="px-6 py-4 font-medium">Price</th>

                      <th className="px-6 py-4 font-medium">Stock</th>

                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product._id}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                      >
                        {/* Product */}
                        <td className="px-6 py-5">
                          <Link
                            to={`/admin/products/${product._id}`}
                            className="group"
                          >
                            <p className="font-semibold text-neutral-900 group-hover:text-neutral-600">
                              {product.name}
                            </p>

                            {product.brand && (
                              <p className="mt-1 text-sm text-neutral-500">
                                {product.brand}
                              </p>
                            )}
                          </Link>
                        </td>

                        {/* SKU */}
                        <td className="px-6 py-5 text-sm text-neutral-600">
                          {product.SKU || "N/A"}
                        </td>

                        {/* Category */}
                        <td className="px-6 py-5 text-sm text-neutral-600">
                          {product.category?.name || "Uncategorized"}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-5 text-sm font-semibold text-neutral-900">
                          ₹{product.price ?? 0}
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-semibold text-neutral-900">
                            {product.availableStock ?? 0}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-start gap-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                product.isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>

                            {!product.isDeleted && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(product)}
                                disabled={loading}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  product.isActive
                                    ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                    : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                              >
                                {product.isActive ? "Deactivate" : "Activate"}
                              </button>
                            )}
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

export default AdminProducts;
