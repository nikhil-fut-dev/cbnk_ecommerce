import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getAdminInventory } from "../../services/adminInventoryApi";

const AdminInventory = () => {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);

  const [search, setSearch] = useState("");
  const [lowStock, setLowStock] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const response = await getAdminInventory({
        search,
        lowStock,
        page,
        limit: 20,
      });

      if (response.success) {
        setInventory(response.data || []);
        setPagination(response.pagination || null);
      } else {
        toast.error(response.message || "Failed to load inventory");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, lowStock, page]);

  const getAvailableStock = (item) => {
    return Math.max(
      Number(item.totalStock || 0) - Number(item.reservedStock || 0),
      0,
    );
  };

  const isLowStock = (item) => {
    const availableStock = getAvailableStock(item);

    const productLow = availableStock <= Number(item.lowStockThreshold || 0);

    const variantLow = (item.variants || []).some((variant) => {
      const available =
        Number(variant.stock || 0) - Number(variant.reservedStock || 0);

      return available <= Number(variant.lowStockThreshold || 0);
    });

    return productLow || variantLow;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Inventory</h1>

          <p className="mt-1 text-sm text-neutral-500">
            Monitor product stock, reservations and inventory levels.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
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
                placeholder="Search product name, SKU or slug..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            {/* Low Stock */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Stock Filter
              </label>

              <label className="flex h-11 cursor-pointer items-center gap-3 rounded-lg border border-neutral-300 px-3">
                <input
                  type="checkbox"
                  checked={lowStock}
                  onChange={(e) => {
                    setLowStock(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4"
                />

                <span className="text-sm text-neutral-700">
                  Show low-stock only
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <p className="text-sm text-neutral-500">Loading inventory...</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
              <h2 className="text-lg font-semibold text-neutral-800">
                No inventory found
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Try changing your search or stock filter.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-neutral-200 bg-neutral-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Product
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Total
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
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-100">
                    {inventory.map((item) => {
                      const product = item.product;

                      const availableStock = getAvailableStock(item);

                      const low = isLowStock(item);

                      return (
                        <tr
                          key={item._id}
                          className="transition hover:bg-neutral-50"
                        >
                          {/* Product */}
                          <td className="px-5 py-4">
                            {product ? (
                              <div className="flex items-center gap-3">
                                {product.images?.[0]?.url ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    className="h-12 w-12 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
                                    No Image
                                  </div>
                                )}

                                <div>
                                  <p className="max-w-xs font-medium text-neutral-900">
                                    {product.name}
                                  </p>

                                  <p className="mt-1 text-xs text-neutral-500">
                                    SKU: {product.SKU || "-"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-neutral-400">
                                Product unavailable
                              </span>
                            )}
                          </td>

                          {/* Total */}
                          <td className="px-5 py-4 text-sm font-medium text-neutral-800">
                            {item.totalStock ?? 0}
                          </td>

                          {/* Reserved */}
                          <td className="px-5 py-4 text-sm text-neutral-600">
                            {item.reservedStock ?? 0}
                          </td>

                          {/* Sold */}
                          <td className="px-5 py-4 text-sm text-neutral-600">
                            {item.soldStock ?? 0}
                          </td>

                          {/* Available */}
                          <td className="px-5 py-4">
                            <span
                              className={`font-semibold ${
                                low ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {availableStock}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            {low ? (
                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                Low Stock
                              </span>
                            ) : (
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                In Stock
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-right">
                            {product ? (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/admin/inventory/${product._id}`)
                                }
                                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                              >
                                View Details
                              </button>
                            ) : (
                              <span className="text-xs text-neutral-400">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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

export default AdminInventory;
