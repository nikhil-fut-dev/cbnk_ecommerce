import { Truck, Cake, Star } from "lucide-react";

const EliteMembership = ({ membership }) => {
  // Agar backend se membership data nahi aaya, section render nahi hoga.
  if (!membership) {
    return null;
  }

  // Backend se milne wale icon name ko Lucide icon se map karna.
  const eliteIconMap = {
    truck: Truck,
    cake: Cake,
    star: Star,
    gift: Cake,
  };

  // Benefits ko sortOrder ke hisaab se arrange karna.
  const eliteBenefits = Array.isArray(membership.benefits)
    ? [...membership.benefits].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      )
    : [];

  return (
    <section className="w-full bg-white">
      <div
        className="
          relative
          mx-auto
          max-w-[1200px]
          overflow-hidden
          bg-[#111111]
          px-4
          py-10
          sm:px-7
          sm:py-12
          lg:px-12
          lg:py-14
        "
      >
        {/* Diagonal background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0px, transparent 10px, rgba(255,255,255,0.025) 10px, rgba(255,255,255,0.025) 20px)",
          }}
        />

        {/* Main content */}
        <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_230px] lg:items-center lg:gap-14">
          {/* Left content */}
          <div className="min-w-0">
            {/* Heading */}
            <div className="mb-7 sm:mb-8">
              <h2
                className="
                  text-[24px]
                  font-bold
                  leading-tight
                  text-white
                  sm:text-[30px]
                  lg:text-[32px]
                "
              >
                {membership.subtitle ||
                  membership.title ||
                  "CBNK Elite Membership"}
              </h2>

              <div className="mt-2 h-[4px] w-[55px] bg-[#d8b28a]" />
            </div>

            {/* Benefits */}
            <div
              className="
                flex
                gap-3
                overflow-x-auto
                pb-3
                scroll-smooth
                snap-x
                snap-mandatory
                scrollbar-hide
                sm:gap-4
                lg:grid
                lg:grid-cols-1
                lg:overflow-visible
                lg:pb-0
                [&::-webkit-scrollbar]:hidden
              "
            >
              {eliteBenefits.map((benefit) => {
                const Icon = eliteIconMap[benefit.icon?.toLowerCase()] ?? Star;

                return (
                  <div
                    key={benefit._id || benefit.id || benefit.title}
                    className="
                      flex
                      h-[78px]
                      w-[270px]
                      shrink-0
                      snap-start
                      items-center
                      gap-4
                      bg-[#d8b28a]
                      px-4
                      transition
                      duration-300
                      hover:bg-[#e1bd98]
                      sm:w-[39px]
                      lg:h-[78px]
                      lg:w-[350px]
                    "
                  >
                    {/* Icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center text-black">
                      <Icon size={25} strokeWidth={1.8} />
                    </div>

                    {/* Benefit text */}
                    <div className="min-w-0">
                      <h3
                        className="
                          text-[14px]
                          font-bold
                          leading-tight
                          text-black
                          sm:text-[15px]
                        "
                      >
                        {benefit.title}
                      </h3>

                      <p
                        className="
                          mt-0.5
                          whitespace-nowrap
                          text-[10px]
                          font-medium
                          text-black
                          sm:text-[11px]
                        "
                      >
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Elite membership card */}
          <div className="mx-auto w-full max-w-[220px] bg-black text-white">
            {/* Card top */}
            <div className="px-4 pb-5 pt-5">
              {/* Logo */}
              <div className="mx-auto flex h-[60px] w-[145px] items-center justify-center overflow-hidden bg-[#F8F9F9]">
                <img
                  src={membership.logo?.url || "/logo.png"}
                  alt={membership.logo?.alt || "CBNK Elite"}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Elite title */}
              <h3
                className="
                  mt-3
                  text-center
                  text-[27px]
                  font-bold
                  lowercase
                  leading-none
                  tracking-wide
                "
              >
                {membership.title || "elite"}
              </h3>

              <p className="mt-2 text-center text-[8px] font-medium uppercase tracking-wide text-white">
                {membership.description ||
                  membership.subtitle ||
                  "NEW LOOK. NEW REWARDS."}
              </p>

              {/* Price */}
              <div className="mt-5 text-center">
                <p className="text-[12px] text-white/70 line-through">
                  ₹
                  {Number(membership.originalPrice ?? 0).toLocaleString(
                    "en-IN",
                  )}
                </p>

                <p className="mt-1 text-[27px] font-bold leading-none">
                  ₹
                  {Number(membership.sellingPrice ?? 0).toLocaleString("en-IN")}
                </p>

                <p className="mt-2 text-[10px] text-white">
                  {membership.taxText || "Inclusive of all taxes"}
                </p>
              </div>
            </div>

            {/* Validity */}
            <div className="mx-5 mb-5 bg-[#292929] py-2 text-center">
              <span className="text-[9px] font-semibold text-white">
                {membership.validityText ||
                  `Valid for ${membership.validityMonths ?? 12} Months`}
              </span>
            </div>

            {/* CTA */}
            <a
              href={membership.ctaLink || "#"}
              className="
                mx-5
                mb-5
                block
                w-[calc(100%-40px)]
                bg-[#d8b28a]
                py-2.5
                text-center
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                text-black
                transition
                hover:bg-[#e1bd98]
              "
            >
              {membership.ctaText || "Join Elite"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EliteMembership;
