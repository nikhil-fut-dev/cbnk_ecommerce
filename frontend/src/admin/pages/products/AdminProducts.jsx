import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getAdminProducts,
  deleteAdminProduct,
  toggleAdminProductStatus,
} from "../../services/adminProductApi";

import { getAdminCategories } from "../../services/adminCategoryApi";

const AdminProducts = () => {
  // =====================================================
  // PRODUCTS
  // =====================================================
  const [products, setProducts] = useState([]);

  // =====================================================
  // CATEGORIES
  // =====================================================
  const [categories, setCategories] = useState([]);

  // =====================================================
  // LOADING / ERROR
  // =====================================================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FILTERS
  // =====================================================
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [isDeleted, setIsDeleted] = useState("");
  const [sort, setSort] = useState("newest");

  // =====================================================
  // PAGINATION
  // =====================================================
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================
  const fetchCategories = async () => {
    try {
      const response = await getAdminCategories({
        page: 1,
        limit: 100,
      });

      if (response?.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminProducts({
        search,
        category,
        status,
        isDeleted,
        page,
        limit: 20,
        sort,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch products");
      }

      setProducts(response.products || []);

      setPagination(
        response.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Failed to fetch products:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load products",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================================================
  // LOAD PRODUCTS WHEN FILTER / PAGE CHANGES
  // =====================================================
  useEffect(() => {
    fetchProducts();
  }, [search, category, status, isDeleted, sort, page]);

  // =====================================================
  // SEARCH
  // =====================================================
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  // =====================================================
  // FILTER CHANGE
  // =====================================================
  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  // =====================================================
  // TOGGLE PRODUCT STATUS
  // =====================================================
  const handleToggleStatus = async (product) => {
    const action = product.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await toggleAdminProductStatus(product._id);

      await fetchProducts();
    } catch (err) {
      console.error("Failed to toggle product status:", err);

      alert(err?.response?.data?.message || "Failed to update product status");
    }
  };

  // =====================================================
  // ARCHIVE PRODUCT
  // =====================================================
  const handleArchiveProduct = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${product.name}"?\n\nThis will deactivate the product and mark it as deleted.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminProduct(product._id);

      await fetchProducts();
    } catch (err) {
      console.error("Failed to archive product:", err);

      alert(err?.response?.data?.message || "Failed to archive product");
    }
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================
  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setIsDeleted("");
    setSort("newest");
    setPage(1);
  };

  // =====================================================
  // PAGE CHANGE
  // =====================================================
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading && products.length === 0) {
    return (
      <div className="p-6">
        <p>Loading products...</p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================
  return (
    <div className="p-6">
      {/* =================================================
          HEADER
      ================================================= */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your CBNK products, inventory status, activation and archived
            products.
          </p>
        </div>

        {/* ADD PRODUCT */}
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Product
        </Link>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          FILTERS
      ================================================= */}
      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* SEARCH */}
          <div>
            <label className="mb-1 block text-sm font-medium">Search</label>

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search product..."
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>

            <select
              value={category}
              onChange={handleFilterChange(setCategory)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>

            <select
              value={status}
              onChange={handleFilterChange(setStatus)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* DELETED */}
          <div>
            <label className="mb-1 block text-sm font-medium">Deleted</label>

            <select
              value={isDeleted}
              onChange={handleFilterChange(setIsDeleted)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
            >
              <option value="">All Products</option>
              <option value="true">Archived</option>
              <option value="false">Not Archived</option>
            </select>
          </div>

          {/* SORT */}
          <div>
            <label className="mb-1 block text-sm font-medium">Sort</label>

            <select
              value={sort}
              onChange={handleFilterChange(setSort)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>
        </div>

        {/* RESET */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleResetFilters}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* =================================================
          PRODUCT TABLE
      ================================================= */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Product</th>

                <th className="px-4 py-3 text-left font-semibold">SKU</th>

                <th className="px-4 py-3 text-left font-semibold">Category</th>

                <th className="px-4 py-3 text-left font-semibold">Price</th>

                <th className="px-4 py-3 text-left font-semibold">Stock</th>

                <th className="px-4 py-3 text-left font-semibold">Status</th>

                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    {/* PRODUCT */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            className="h-12 w-12 rounded-lg border object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-gray-100 text-xs text-gray-400">
                            No Image
                          </div>
                        )}

                        <div>
                          <p className="font-medium">{product.name}</p>

                          <p className="text-xs text-gray-500">
                            {product.brand || "CBNK"}
                          </p>

                          {product.isDeleted && (
                            <span className="mt-1 inline-block text-xs text-red-600">
                              Archived
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-4">{product.SKU || "-"}</td>

                    {/* CATEGORY */}
                    <td className="px-4 py-4">
                      {product.category?.name || product.category?.title || "-"}
                    </td>

                    {/* PRICE */}
                    <td className="px-4 py-4">
                      ₹{Number(product.price || 0).toLocaleString("en-IN")}
                    </td>

                    {/* STOCK */}
                    <td className="px-4 py-4">
                      <div>
                        <span className="font-medium">
                          {product.availableStock ?? product.stock ?? 0}
                        </span>

                        {product.inventory?.lowStock && (
                          <span className="ml-2 text-xs text-orange-600">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.isDeleted
                            ? "bg-red-100 text-red-700"
                            : product.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {product.isDeleted
                          ? "Archived"
                          : product.isActive
                            ? "Active"
                            : "Inactive"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        {/* VIEW */}
                        <Link
                          to={`/admin/products/${product._id}`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                        >
                          View
                        </Link>

                        {/* EDIT */}
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                        >
                          Edit
                        </Link>

                        {/* STATUS */}
                        {!product.isDeleted && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(product)}
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                          >
                            {product.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}

                        {/* ARCHIVE */}
                        {!product.isDeleted && (
                          <button
                            type="button"
                            onClick={() => handleArchiveProduct(product)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}
        <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page || page} of {pagination.totalPages || 1}
            {" • "}
            {pagination.total || products.length} products
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={page <= 1 || loading}
              className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={page >= (pagination.totalPages || 1) || loading}
              className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          REFRESHING INDICATOR
      ================================================= */}
      {loading && products.length > 0 && (
        <p className="mt-3 text-right text-xs text-gray-500">
          Updating products...
        </p>
      )}
    </div>
  );
};

export default AdminProducts;
