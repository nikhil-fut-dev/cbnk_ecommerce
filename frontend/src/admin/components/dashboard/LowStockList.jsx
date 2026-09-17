import { AlertTriangle, ArrowRight, PackageX } from "lucide-react";
import { Link } from "react-router-dom";

const LowStockList = ({ products = [] }) => {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-neutral-950">
            Low Stock Alerts
          </h2>

          <p className="mt-1 text-xs text-neutral-500">
            Products that need inventory attention
          </p>
        </div>

        <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-red-50 px-3 text-xs font-bold text-red-600">
          {products.length}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
            <PackageX size={21} />
          </div>

          <p className="mt-3 text-sm font-semibold text-neutral-800">
            Inventory looks healthy
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            No low-stock products right now.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-4 px-5 py-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {product.name || "Unnamed Product"}
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  SKU: {product.SKU || "N/A"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-red-600">
                  {product.availableStock ?? product.stock ?? 0}
                </p>

                <p className="text-[11px] text-neutral-400">available</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <div className="border-t border-neutral-100 px-5 py-3">
          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950"
          >
            View inventory
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </section>
  );
};

export default LowStockList;
