const PoloShop = ({ items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1200px] px-3 py-5 sm:px-5 sm:py-7 lg:px-0">
        {items.map((item) => (
          <div key={item._id || item.id} className="mb-6 last:mb-0">
            <div className="mb-2">
              <h2 className="inline-block text-[18px] font-bold leading-none text-black sm:text-[21px] lg:text-[24px]">
                {item.smallText || "The Polo Shop"}
              </h2>

              <div className="mt-1 h-[4px] w-[50px] bg-[#d8b28a] sm:w-[55px]" />
            </div>

            <div className="relative w-full overflow-hidden bg-neutral-200">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet={item.mobileImage?.url || item.desktopImage?.url || ""}
                />

                <img
                  src={item.desktopImage?.url || item.mobileImage?.url || ""}
                  alt={
                    item.desktopImage?.alt ||
                    item.mobileImage?.alt ||
                    item.title ||
                    "The Polo Shop"
                  }
                  className="h-[190px] w-full object-cover object-center sm:h-[240px] md:h-[300px] lg:h-[390px] xl:h-[430px]"
                />
              </picture>

              <div className="absolute inset-y-0 left-0 w-[70%] bg-gradient-to-r from-black/60 via-black/25 to-transparent sm:w-[60%]" />

              <div className="absolute left-[5%] top-1/2 z-10 -translate-y-1/2 text-white sm:left-[5%] lg:left-[4%]">
                <h2 className="max-w-[190px] text-[20px] font-bold uppercase leading-[1.05] tracking-tight text-white drop-shadow-lg sm:max-w-[280px] sm:text-[27px] md:max-w-[370px] md:text-[36px] lg:max-w-[500px] lg:text-[46px] xl:text-[52px]">
                  {item.title}
                </h2>

                <p className="mt-2 text-[12px] font-semibold text-white drop-shadow-md sm:mt-3 sm:text-[14px] md:text-[17px] lg:mt-4 lg:text-[20px] xl:text-[22px]">
                  {item.priceText}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PoloShop;
