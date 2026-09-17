const LowStockList = ({ products = [] }) => {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">Low Stock</h2>

        <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
          {products.length}
        </span>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No low-stock products.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between border-b border-neutral-100 pb-4 last:border-0"
            >
              <div>
                <p className="font-medium text-neutral-900">{product.name}</p>

                <p className="mt-1 text-sm text-neutral-500">
                  SKU: {product.SKU || "N/A"}
                </p>
              </div>

              <span className="text-sm font-semibold text-red-600">
                {product.stock ?? product.availableStock ?? 0} left
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default LowStockList;
