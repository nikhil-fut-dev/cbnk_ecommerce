import { Link } from "react-router-dom";

const CtaWrapper = ({ item, className, children }) => {
  const link = item.cta?.link?.trim() || "";
  const openInNewTab = Boolean(item.cta?.openInNewTab);
  const isExternal = /^https?:\/\//i.test(link);

  if (!link) {
    return <div className={className}>{children}</div>;
  }

  const ariaLabel = item.cta?.text || item.title || "View collection";

  if (isExternal || openInNewTab) {
    return (
      <a
        href={link}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={link} aria-label={ariaLabel} className={className}>
      {children}
    </Link>
  );
};

const SleepwearEdit = ({ items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1200px] px-3 py-5 sm:px-5 sm:py-7 lg:px-0">
        <div className="mb-2">
          <h2 className="inline-block text-[20px] font-bold leading-none text-black sm:text-[24px]">
            Sleepwear Edit
          </h2>
          <div className="mt-1 h-[4px] w-[50px] bg-[#d8b28a]" />
        </div>

        <div className="flex gap-4 overflow-x-auto scroll-smooth pb-3">
          {items.map((item) => (
            <CtaWrapper
              key={item._id || item.id}
              item={item}
              className="relative block w-full shrink-0 cursor-pointer overflow-hidden bg-neutral-200"
            >
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
                    "Sleepwear Edit"
                  }
                  className="h-[260px] w-full object-cover object-center sm:h-[320px] md:h-[380px] lg:h-[500px]"
                />
              </picture>

              <div className="absolute inset-0 bg-black/30 pointer-events-none" />

              <div className="absolute left-[6%] top-1/2 z-10 -translate-y-1/2 text-white sm:left-[7%] md:left-[6%] pointer-events-none">
                <p className="text-[13px] font-semibold leading-tight text-white drop-shadow-md sm:text-[17px] md:text-[21px] lg:text-[26px]">
                  {item.smallText}
                </p>

                <h2 className="mt-2 text-[23px] font-bold leading-tight text-white drop-shadow-md sm:mt-3 sm:text-[30px] md:text-[38px] lg:text-[44px]">
                  {item.title}
                </h2>

                <p className="mt-2 text-[13px] font-semibold text-white drop-shadow-md sm:mt-3 sm:text-[17px] md:text-[21px] lg:text-[25px]">
                  {item.priceText}
                </p>
              </div>
            </CtaWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SleepwearEdit;
