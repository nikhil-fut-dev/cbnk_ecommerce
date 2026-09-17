const OrderStatusCard = ({ title, value }) => {
  return (
    <div>
      <p className="text-sm text-neutral-500">{title}</p>

      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
};

export default OrderStatusCard;
