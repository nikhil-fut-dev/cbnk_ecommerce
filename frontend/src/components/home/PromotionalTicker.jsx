const PromotionalTicker = ({ items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#56585a]">
      {/* Diagonal Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0px, transparent 9px, #ffffff 9px, #ffffff 18px)",
          }}
        />
      </div>

      {/* Ticker Content */}
      <div className="relative mx-auto flex h-[38px] max-w-[1200px] items-center justify-center overflow-hidden px-4">
        <div className="whitespace-nowrap text-center text-[11px] font-medium text-white sm:text-[13px]">
          {items.map((item, index) => (
            <span key={item._id || item.id || index}>
              {item.text}

              {item.couponCode && (
                <>
                  {" "}
                  Code: <span className="font-bold">{item.couponCode}</span>
                </>
              )}

              {index < items.length - 1 && (
                <span className="mx-3 text-white/60">|</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionalTicker;
