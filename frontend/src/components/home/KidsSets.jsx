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

const KidsSets = ({ items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <section className="w-full bg-white [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto max-w-[1200px] px-3 py-5 sm:px-5 sm:py-7 lg:px-0">
        <div className="mb-2">
          <h2 className="inline-block text-[20px] font-bold leading-none text-black sm:text-[24px]">
            New In - Kids Sets
          </h2>
          <div className="mt-1 h-[4px] w-[50px] bg-[#d8b28a]" />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 scroll-smooth scrollbar-hide snap-x snap-mandatory sm:gap-4 lg:overflow-x-hidden [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <CtaWrapper
              key={item._id || item.id}
              item={item}
              className="group relative block h-[300px] w-[210px] shrink-0 cursor-pointer overflow-hidden bg-neutral-200 snap-start sm:h-[320px] sm:w-[230px] lg:h-[320px] lg:flex-1 lg:w-auto"
            >
              <img
                src={item.image?.url || "/placeholder.png"}
                alt={item.image?.alt || item.title || "Kids Set"}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                <h3 className="text-[15px] font-bold text-white drop-shadow-md sm:text-[16px]">
                  {item.title}
                </h3>
              </div>
            </CtaWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KidsSets;
