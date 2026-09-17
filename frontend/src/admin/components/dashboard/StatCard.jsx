const StatCard = ({ title, value }) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{title}</p>

      <h2 className="mt-2 text-3xl font-bold text-neutral-900">{value}</h2>
    </div>
  );
};

export default StatCard;
