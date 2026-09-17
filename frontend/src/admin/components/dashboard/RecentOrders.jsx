const RecentOrders = ({ orders = [] }) => {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-900">Recent Orders</h2>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No recent orders.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-neutral-200 text-sm text-neutral-500">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="py-4 font-medium text-neutral-900">
                    {order.orderNumber || order._id}
                  </td>

                  <td className="py-4 text-neutral-600">
                    {order.user?.fullName || "Unknown"}
                  </td>

                  <td className="py-4 font-medium text-neutral-900">
                    ₹{order.total}
                  </td>

                  <td className="py-4">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default RecentOrders;
