const OrderStatusCard = ({ title, value, tone = "neutral" }) => {
  const dotColor = {
    neutral: "bg-neutral-400",
    warning: "bg-amber-500",
    info: "bg-blue-500",
    processing: "bg-violet-500",
    success: "bg-green-500",
    danger: "bg-red-500",
  };

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition hover:bg-white hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-500">{title}</p>

        <span
          className={`h-2 w-2 rounded-full ${
            dotColor[tone] || dotColor.neutral
          }`}
        />
      </div>

      <p className="mt-2 text-2xl font-bold text-neutral-950">{value ?? 0}</p>
    </div>
  );
};

export default OrderStatusCard;
