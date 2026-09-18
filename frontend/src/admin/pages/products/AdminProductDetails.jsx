import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getAdminProductById,
  deleteAdminProduct,
  toggleAdminProductStatus,
} from "../../services/adminProductApi";

const AdminProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // PRODUCT
  // =====================================================
  const [product, setProduct] = useState(null);

  // =====================================================
  // LOADING / ERROR
  // =====================================================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH PRODUCT
  // =====================================================
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminProductById(id);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch product");
      }

      // Backend admin product response may use `product`
      // for the actual product object.
      setProduct(response.product || response.data || null);
    } catch (err) {
      console.error("Failed to fetch product:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load product",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // =====================================================
  // TOGGLE STATUS
  // =====================================================
  const handleToggleStatus = async () => {
    if (!product) {
      return;
    }

    const action = product.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await toggleAdminProductStatus(product._id);

      await fetchProduct();
    } catch (err) {
      console.error("Failed to update product status:", err);

      alert(err?.response?.data?.message || "Failed to update product status");
    }
  };

  // =====================================================
  // ARCHIVE PRODUCT
  // =====================================================
  const handleArchiveProduct = async () => {
    if (!product) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to archive "${product.name}"?\n\nThis will deactivate the product and mark it as deleted.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminProduct(product._id);

      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to archive product:", err);

      alert(err?.response?.data?.message || "Failed to archive product");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="p-6">
        <p>Loading product...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================
  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>

        <Link
          to="/admin/products"
          className="inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  // =====================================================
  // PRODUCT NOT FOUND
  // =====================================================
  if (!product) {
    return (
      <div className="p-6">
        <p className="mb-4 text-gray-500">Product not found.</p>

        <Link
          to="/admin/products"
          className="inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  // =====================================================
  // INVENTORY
  // =====================================================
  const inventory = product.inventory || {};

  const availableStock =
    product.availableStock ?? inventory.availableStock ?? product.stock ?? 0;

  const totalStock = inventory.totalStock ?? product.stock ?? 0;

  const reservedStock = inventory.reservedStock ?? 0;

  const soldStock = inventory.soldStock ?? 0;

  const inventoryVariants = inventory.variants || [];

  // =====================================================
  // PAGE
  // =====================================================
  return (
    <div className="p-6">
      {/* =================================================
          HEADER
      ================================================= */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            to="/admin/products"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Products
          </Link>

          <h1 className="mt-3 text-2xl font-bold">{product.name}</h1>

          <p className="mt-1 text-sm text-gray-500">
            Product ID: {product._id}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/admin/products/${product._id}/edit`}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Edit Product
          </Link>

          {!product.isDeleted && (
            <>
              <button
                type="button"
                onClick={handleToggleStatus}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                {product.isActive ? "Deactivate" : "Activate"}
              </button>

              <button
                type="button"
                onClick={handleArchiveProduct}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Archive
              </button>
            </>
          )}

          <button
            type="button"
            onClick={fetchProduct}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* =================================================
          STATUS
      ================================================= */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
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

        {product.isFeatured && (
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
            Featured
          </span>
        )}

        {product.isNewArrival && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            New Arrival
          </span>
        )}

        {product.isBestSeller && (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
            Best Seller
          </span>
        )}
      </div>

      {/* =================================================
          MAIN GRID
      ================================================= */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* =================================================
            IMAGES
        ================================================= */}
        <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">Product Images</h2>

          {product.images?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {product.images.map((image, index) => (
                <div
                  key={image._id || image.publicId || index}
                  className="overflow-hidden rounded-lg border"
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${product.name} ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-gray-50 text-sm text-gray-400">
              No images available
            </div>
          )}
        </div>

        {/* =================================================
            PRODUCT INFORMATION
        ================================================= */}
        <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold">Product Information</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* SKU */}
            <div>
              <p className="text-xs text-gray-500">SKU</p>
              <p className="mt-1 font-medium">{product.SKU || "-"}</p>
            </div>

            {/* BRAND */}
            <div>
              <p className="text-xs text-gray-500">Brand</p>
              <p className="mt-1 font-medium">{product.brand || "CBNK"}</p>
            </div>

            {/* CATEGORY */}
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="mt-1 font-medium">
                {product.category?.name || product.category?.title || "-"}
              </p>
            </div>

            {/* SUB CATEGORY */}
            <div>
              <p className="text-xs text-gray-500">Sub Category</p>
              <p className="mt-1 font-medium">
                {product.subCategory?.name || product.subCategory?.title || "-"}
              </p>
            </div>

            {/* GENDER */}
            <div>
              <p className="text-xs text-gray-500">Gender</p>
              <p className="mt-1 font-medium">{product.gender || "-"}</p>
            </div>

            {/* AGE GROUP */}
            <div>
              <p className="text-xs text-gray-500">Age Group</p>
              <p className="mt-1 font-medium">{product.ageGroup || "-"}</p>
            </div>

            {/* PRICE */}
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="mt-1 text-lg font-semibold">
                ₹{Number(product.price || 0).toLocaleString("en-IN")}
              </p>
            </div>

            {/* COMPARE PRICE */}
            <div>
              <p className="text-xs text-gray-500">Compare At Price</p>
              <p className="mt-1 font-medium">
                {product.compareAtPrice
                  ? `₹${Number(product.compareAtPrice).toLocaleString("en-IN")}`
                  : "-"}
              </p>
            </div>

            {/* DISCOUNT */}
            <div>
              <p className="text-xs text-gray-500">Discount</p>
              <p className="mt-1 font-medium">{product.discount ?? 0}%</p>
            </div>

            {/* MATERIAL */}
            <div>
              <p className="text-xs text-gray-500">Material</p>
              <p className="mt-1 font-medium">{product.material || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          DESCRIPTION
      ================================================= */}
      <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Description</h2>

        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
          {product.description || "No description available."}
        </p>

        {product.shortDescription && (
          <div className="mt-5 border-t pt-5">
            <p className="mb-1 text-xs font-medium text-gray-500">
              Short Description
            </p>

            <p className="text-sm text-gray-600">{product.shortDescription}</p>
          </div>
        )}
      </div>

      {/* =================================================
          SIZES / COLORS / TAGS
      ================================================= */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {/* SIZES */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Sizes</h2>

          <div className="flex flex-wrap gap-2">
            {product.sizes?.length > 0 ? (
              product.sizes.map((size) => (
                <span
                  key={size}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                >
                  {size}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400">No sizes</p>
            )}
          </div>
        </div>

        {/* COLORS */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Colors</h2>

          <div className="flex flex-wrap gap-2">
            {product.colors?.length > 0 ? (
              product.colors.map((color) => (
                <span
                  key={color}
                  className="rounded-lg border px-3 py-1.5 text-sm"
                >
                  {color}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400">No colors</p>
            )}
          </div>
        </div>

        {/* TAGS */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Tags</h2>

          <div className="flex flex-wrap gap-2">
            {product.tags?.length > 0 ? (
              product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400">No tags</p>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          INVENTORY SUMMARY
      ================================================= */}
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">Inventory</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* AVAILABLE */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Available Stock</p>

            <p className="mt-2 text-2xl font-bold">{availableStock}</p>
          </div>

          {/* TOTAL */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Stock</p>

            <p className="mt-2 text-2xl font-bold">{totalStock}</p>
          </div>

          {/* RESERVED */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Reserved</p>

            <p className="mt-2 text-2xl font-bold">{reservedStock}</p>
          </div>

          {/* SOLD */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Sold</p>

            <p className="mt-2 text-2xl font-bold">{soldStock}</p>
          </div>
        </div>
      </div>

      {/* =================================================
          VARIANTS
      ================================================= */}
      <div className="mt-6 rounded-xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Product Variants</h2>
        </div>

        {product.variants?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Size</th>

                  <th className="px-4 py-3 text-left font-semibold">Color</th>

                  <th className="px-4 py-3 text-left font-semibold">SKU</th>

                  <th className="px-4 py-3 text-left font-semibold">Price</th>

                  <th className="px-4 py-3 text-left font-semibold">Stock</th>

                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {product.variants.map((variant, index) => {
                  const inventoryVariant = inventoryVariants.find(
                    (item) =>
                      item.variant?.toString() === variant._id?.toString() ||
                      item.SKU === variant.SKU,
                  );

                  return (
                    <tr key={variant._id || index}>
                      <td className="px-4 py-3">{variant.size || "-"}</td>

                      <td className="px-4 py-3">{variant.color || "-"}</td>

                      <td className="px-4 py-3">{variant.SKU || "-"}</td>

                      <td className="px-4 py-3">
                        {variant.price != null
                          ? `₹${Number(variant.price).toLocaleString("en-IN")}`
                          : "Product price"}
                      </td>

                      <td className="px-4 py-3">
                        {inventoryVariant?.stock ?? variant.stock ?? 0}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            variant.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {variant.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-sm text-gray-400">
            No variants configured.
          </div>
        )}
      </div>

      {/* =================================================
          SPECIFICATIONS
      ================================================= */}
      {product.specifications &&
        Object.keys(product.specifications).length > 0 && (
          <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Specifications</h2>

            <div className="divide-y">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="grid gap-2 py-3 sm:grid-cols-2">
                  <span className="text-sm font-medium">{key}</span>

                  <span className="text-sm text-gray-600">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* =================================================
          META INFORMATION
      ================================================= */}
      <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Meta Information</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="mt-1 text-sm">
              {product.createdAt
                ? new Date(product.createdAt).toLocaleString("en-IN")
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Updated</p>
            <p className="mt-1 text-sm">
              {product.updatedAt
                ? new Date(product.updatedAt).toLocaleString("en-IN")
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Product ID</p>
            <p className="mt-1 break-all text-sm">{product._id}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Slug</p>
            <p className="mt-1 break-all text-sm">{product.slug || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetails;
