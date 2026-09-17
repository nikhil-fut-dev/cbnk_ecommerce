import { ArrowRight, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

const RecentCustomers = ({ customers = [] }) => {
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-neutral-950">
            Recent Customers
          </h2>

          <p className="mt-1 text-xs text-neutral-500">
            Newly registered customers
          </p>
        </div>

        <Link
          to="/admin/users"
          className="hidden items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-950 sm:flex"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
          <UserRound size={24} className="text-neutral-400" />

          <p className="mt-3 text-sm text-neutral-500">No recent customers.</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {customers.map((customer) => (
            <div
              key={customer._id}
              className="flex items-center gap-3 px-5 py-4 transition hover:bg-neutral-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                {(customer.fullName || customer.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  to={`/admin/users/${customer._id}`}
                  className="block truncate text-sm font-semibold text-neutral-900 hover:underline"
                >
                  {customer.fullName || "Unnamed Customer"}
                </Link>

                <p className="truncate text-xs text-neutral-500">
                  {customer.email || "-"}
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-xs text-neutral-400">Joined</p>

                <p className="mt-0.5 text-xs font-medium text-neutral-600">
                  {formatDate(customer.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentCustomers;
