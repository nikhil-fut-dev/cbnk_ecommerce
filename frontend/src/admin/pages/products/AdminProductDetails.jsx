import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getAdminProductById } from "../../services/adminProductApi";

const AdminProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const response = await getAdminProductById(id);

      if (response.success) {
        setProduct(response.product);
      } else {
        toast.error(response.message || "Unable to load product");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load product";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />

          <p className="mt-4 text-sm text-neutral-500">Loading product...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">
            Product not found
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            The requested product could not be loaded.
          </p>

          <Link
            to="/admin/products"
            className="mt-6 inline-flex rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const inventory = product.inventory;

  return (
    <main className="min-h-screen bg-neutral-100 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/products"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            ← Back to Products
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                {product.name}
              </h1>

              {product.brand && (
                <p className="mt-2 text-neutral-500">{product.brand}</p>
              )}
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                product.isActive
                  ? "bg-green-50 text-green-700"
                  : "bg-neutral-200 text-neutral-700"
              }`}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Basic Information */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">
            Product Information
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-neutral-500">Price</p>

              <p className="mt-1 text-lg font-semibold text-neutral-900">
                ₹{product.price ?? 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">Category</p>

              <p className="mt-1 font-medium text-neutral-900">
                {product.category?.name || "Uncategorized"}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">Sub-category</p>

              <p className="mt-1 font-medium text-neutral-900">
                {product.subCategory?.name || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">Gender</p>

              <p className="mt-1 font-medium text-neutral-900">
                {product.gender || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">Available Stock</p>

              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {product.availableStock ?? 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500">Product ID</p>

              <p className="mt-1 break-all text-sm font-medium text-neutral-700">
                {product._id}
              </p>
            </div>
          </div>
        </section>

        {/* Inventory */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Inventory</h2>

          {inventory ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-neutral-500">Total Stock</p>

                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {inventory.totalStock ?? 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Reserved Stock</p>

                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {inventory.reservedStock ?? 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Sold Stock</p>

                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {inventory.soldStock ?? 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Low Stock Threshold</p>

                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {inventory.lowStockThreshold ?? 0}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-neutral-500">
              Inventory information is not available.
            </p>
          )}
        </section>

        {/* Variants */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Variants</h2>

          {!inventory?.variants?.length ? (
            <p className="mt-5 text-sm text-neutral-500">
              No inventory variants available.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-neutral-200 text-sm text-neutral-500">
                    <th className="pb-3 font-medium">SKU</th>

                    <th className="pb-3 font-medium">Size</th>

                    <th className="pb-3 font-medium">Color</th>

                    <th className="pb-3 font-medium">Stock</th>

                    <th className="pb-3 font-medium">Reserved</th>

                    <th className="pb-3 font-medium">Sold</th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.variants.map((variant) => (
                    <tr
                      key={variant.variant || variant._id || variant.SKU}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="py-4 text-sm font-medium text-neutral-900">
                        {variant.SKU || "N/A"}
                      </td>

                      <td className="py-4 text-sm text-neutral-600">
                        {variant.size || "N/A"}
                      </td>

                      <td className="py-4 text-sm text-neutral-600">
                        {variant.color || "N/A"}
                      </td>

                      <td className="py-4 text-sm font-semibold text-neutral-900">
                        {variant.stock ?? 0}
                      </td>

                      <td className="py-4 text-sm text-neutral-600">
                        {variant.reservedStock ?? 0}
                      </td>

                      <td className="py-4 text-sm text-neutral-600">
                        {variant.soldStock ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Refresh */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={fetchProduct}
            disabled={loading}
            className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh Product"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default AdminProductDetails;
