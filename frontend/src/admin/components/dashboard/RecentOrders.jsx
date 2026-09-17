import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const RecentOrders = ({ orders = [] }) => {
  const getStatusClass = (status) => {
    const classes = {
      PENDING: "bg-amber-50 text-amber-700",
      CONFIRMED: "bg-blue-50 text-blue-700",
      PROCESSING: "bg-violet-50 text-violet-700",
      SHIPPED: "bg-indigo-50 text-indigo-700",
      OUT_FOR_DELIVERY: "bg-cyan-50 text-cyan-700",
      DELIVERED: "bg-green-50 text-green-700",
      CANCELLED: "bg-red-50 text-red-700",
    };

    return classes[status] || "bg-neutral-100 text-neutral-600";
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-neutral-950">
            Recent Orders
          </h2>

          <p className="mt-1 text-xs text-neutral-500">
            Latest customer orders
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="hidden items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-950 sm:flex"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
          <ShoppingBag size={24} className="text-neutral-400" />

          <p className="mt-3 text-sm text-neutral-500">No recent orders.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Order
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Customer
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Amount
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {orders.map((order) => (
                <tr key={order._id} className="transition hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-5 py-4">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-sm font-semibold text-neutral-900 hover:underline"
                    >
                      {order.orderNumber || order._id}
                    </Link>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="text-sm text-neutral-700">
                      {order.user?.fullName || "Unknown"}
                    </p>

                    <p className="mt-0.5 text-xs text-neutral-400">
                      {order.user?.email || ""}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-neutral-900">
                    ₹{Number(order.total || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                        order.orderStatus,
                      )}`}
                    >
                      {(order.orderStatus || "UNKNOWN").replaceAll("_", " ")}
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
