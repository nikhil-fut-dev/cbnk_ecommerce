// ==========================================
// StatCard.jsx
// ==========================================

import {
  Users,
  Package,
  ShoppingBag,
  IndianRupee,
  Activity,
  CreditCard,
} from "lucide-react";

const iconMap = {
  customers: Users,
  products: Package,
  orders: ShoppingBag,
  revenue: IndianRupee,
  active: Activity,
  paid: CreditCard,
};

const StatCard = ({ title, value, type = "customers", subtitle }) => {
  const Icon = iconMap[type] || Activity;

  return (
    <div className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 md:text-3xl">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition group-hover:bg-neutral-900 group-hover:text-white">
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// OrderStatusCard.jsx
// ==========================================

export const OrderStatusCard = ({ title, value, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700",
    warning: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-blue-700",
    processing: "bg-violet-50 text-violet-700",
    success: "bg-green-50 text-green-700",
    danger: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-500">{title}</p>

        <span
          className={`h-2 w-2 rounded-full ${
            tone === "success"
              ? "bg-green-500"
              : tone === "danger"
                ? "bg-red-500"
                : tone === "warning"
                  ? "bg-amber-500"
                  : tone === "info"
                    ? "bg-blue-500"
                    : tone === "processing"
                      ? "bg-violet-500"
                      : "bg-neutral-400"
          }`}
        />
      </div>

      <p className="mt-2 text-2xl font-bold text-neutral-950">{value ?? 0}</p>
    </div>
  );
};

export default StatCard;
