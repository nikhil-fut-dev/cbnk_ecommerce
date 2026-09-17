const RecentCustomers = ({ customers = [] }) => {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-900">
        Recent Customers
      </h2>

      {customers.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No recent customers.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {customers.map((customer) => (
            <div
              key={customer._id}
              className="flex items-center justify-between border-b border-neutral-100 pb-4 last:border-0"
            >
              <div>
                <p className="font-medium text-neutral-900">
                  {customer.fullName}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  {customer.email}
                </p>
              </div>

              <span className="text-xs font-medium text-neutral-500">
                {customer.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentCustomers;
