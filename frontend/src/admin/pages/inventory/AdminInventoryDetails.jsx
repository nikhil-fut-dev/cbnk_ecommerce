import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getProductInventory,
  restockProduct,
  syncProductInventory,
} from "../../services/adminInventoryApi";

const AdminInventoryDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [restockLoading, setRestockLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const [quantity, setQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");

  const [selectedVariant, setSelectedVariant] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const response = await getProductInventory(id);

      if (!response.success) {
        toast.error(response.message || "Failed to load inventory");
        return;
      }

      setInventory(response.data);

      if (response.data) {
        setLowStockThreshold(response.data.lowStockThreshold ?? "");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [id]);

  const getAvailableStock = (stock, reservedStock) => {
    return Math.max(Number(stock || 0) - Number(reservedStock || 0), 0);
  };

  const handleRestock = async () => {
    if (!quantity || Number(quantity) < 1) {
      toast.error("Restock quantity must be at least 1");
      return;
    }

    if (lowStockThreshold !== "" && Number(lowStockThreshold) < 0) {
      toast.error("Low-stock threshold cannot be negative");
      return;
    }

    try {
      setRestockLoading(true);

      const payload = {
        quantity: Number(quantity),
      };

      if (selectedVariant) {
        payload.variantId = selectedVariant.variant;
      }

      if (lowStockThreshold !== "") {
        payload.lowStockThreshold = Number(lowStockThreshold);
      }

      const response = await restockProduct(id, payload);

      if (!response.success) {
        toast.error(response.message || "Failed to restock");
        return;
      }

      toast.success(response.message || "Inventory restocked successfully");

      setQuantity("");
      setSelectedVariant(null);

      await fetchInventory();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to restock inventory",
      );
    } finally {
      setRestockLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncLoading(true);

      const response = await syncProductInventory(id);

      if (!response.success) {
        toast.error(response.message || "Failed to sync inventory");
        return;
      }

      toast.success(response.message || "Inventory synchronized successfully");

      await fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to sync inventory");
    } finally {
      setSyncLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">Loading inventory...</p>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-neutral-600">Inventory not found.</p>

        <button
          type="button"
          onClick={() => navigate("/admin/inventory")}
          className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  const product = inventory.product;

  const availableStock = getAvailableStock(
    inventory.totalStock,
    inventory.reservedStock,
  );

  const hasVariants = inventory.variants && inventory.variants.length > 0;

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/inventory")}
              className="mb-3 text-sm font-medium text-neutral-500 hover:text-neutral-900"
            >
              ← Back to Inventory
            </button>

            <h1 className="text-2xl font-bold text-neutral-900">
              Inventory Details
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Manage stock and inventory for this product.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSync}
            disabled={syncLoading}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {syncLoading ? "Syncing..." : "Sync Inventory"}
          </button>
        </div>

        {/* Product */}
        <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            {product?.images?.[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-neutral-100 text-xs text-neutral-400">
                No Image
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                {product?.name || "Unknown Product"}
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                SKU: {product?.SKU || "-"}
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Slug: {product?.slug || "-"}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Total Stock</p>

            <p className="mt-2 text-2xl font-bold text-neutral-900">
              {inventory.totalStock ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Reserved Stock</p>

            <p className="mt-2 text-2xl font-bold text-neutral-900">
              {inventory.reservedStock ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Sold Stock</p>

            <p className="mt-2 text-2xl font-bold text-neutral-900">
              {inventory.soldStock ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Available Stock</p>

            <p
              className={`mt-2 text-2xl font-bold ${
                availableStock <= Number(inventory.lowStockThreshold || 0)
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {availableStock}
            </p>
          </div>
        </section>

        {/* Restock */}
        <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">
            Restock Inventory
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Add stock to the product or a specific variant.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {/* Variant */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Variant
              </label>

              <select
                value={selectedVariant?.variant || ""}
                onChange={(e) => {
                  const variant = inventory.variants?.find(
                    (item) => item.variant === e.target.value,
                  );

                  setSelectedVariant(variant || null);

                  if (!variant) {
                    setLowStockThreshold(inventory.lowStockThreshold ?? "");
                  } else {
                    setLowStockThreshold(variant.lowStockThreshold ?? "");
                  }
                }}
                disabled={!hasVariants}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-100"
              >
                <option value="">
                  {hasVariants ? "Entire Product" : "Simple Product"}
                </option>

                {inventory.variants?.map((variant) => (
                  <option key={variant.variant} value={variant.variant}>
                    {variant.size || "No Size"}
                    {" / "}
                    {variant.color || "No Color"}
                    {" — "}
                    {variant.SKU || "No SKU"}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Quantity *
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            {/* Threshold */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Low Stock Threshold
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleRestock}
              disabled={restockLoading}
              className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {restockLoading ? "Restocking..." : "Restock Inventory"}
            </button>
          </div>
        </section>

        {/* Variants */}
        {hasVariants && (
          <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Variant Inventory
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Stock information for each product variant.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-neutral-200 bg-neutral-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Variant
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      SKU
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Stock
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Reserved
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Sold
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Available
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Threshold
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {inventory.variants.map((variant) => {
                    const variantAvailable = getAvailableStock(
                      variant.stock,
                      variant.reservedStock,
                    );

                    const variantLow =
                      variantAvailable <=
                      Number(variant.lowStockThreshold || 0);

                    return (
                      <tr key={variant.variant} className="hover:bg-neutral-50">
                        <td className="px-5 py-4 text-sm text-neutral-800">
                          {variant.size || "No Size"}
                          {" / "}
                          {variant.color || "No Color"}
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {variant.SKU || "-"}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-neutral-800">
                          {variant.stock ?? 0}
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {variant.reservedStock ?? 0}
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {variant.soldStock ?? 0}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`font-semibold ${
                              variantLow ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {variantAvailable}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-neutral-600">
                          {variant.lowStockThreshold ?? 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminInventoryDetails;
