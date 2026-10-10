import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Fallback banners: API data unavailable hone par default design dikhega.
const defaultBanners = [
  {
    id: "default-1",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=90",
    smallText: "YOUR WORLD",
    title: "YOUR STYLE",
    description: "",
    ctaText: "",
    ctaLink: "",
  },
  {
    id: "default-2",
    image:
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1800&q=90",
    smallText: "NEW SEASON",
    title: "NEW LOOK",
    description: "",
    ctaText: "",
    ctaLink: "",
  },
  {
    id: "default-3",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=90",
    smallText: "CBNK COLLECTION",
    title: "OWN YOUR STYLE",
    description: "",
    ctaText: "",
    ctaLink: "",
  },
  {
    id: "default-4",
    image:
      "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?auto=format&fit=crop&w=1800&q=90",
    smallText: "EVERYDAY EDIT",
    title: "LOOK YOUR BEST",
    description: "",
    ctaText: "",
    ctaLink: "",
  },
  {
    id: "default-5",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=90",
    smallText: "CBNK",
    title: "FIND YOUR FIT",
    description: "",
    ctaText: "",
    ctaLink: "",
  },
];

const HeroBanner = ({ banners = [] }) => {
  // Backend se aaye data ko component ke format mein convert karein.
  const slides = (Array.isArray(banners) ? banners : [])
    .filter(
      (banner) =>
        banner &&
        banner.isActive !== false &&
        banner.isDeleted !== true &&
        (!banner.status || banner.status === "PUBLISHED"),
    )
    .map((banner, index) => {
      // Backend mein desktopImage/mobileImage objects hain.
      const desktopImage =
        typeof banner.desktopImage === "string"
          ? banner.desktopImage
          : banner.desktopImage?.url;

      const mobileImage =
        typeof banner.mobileImage === "string"
          ? banner.mobileImage
          : banner.mobileImage?.url;

      return {
        id: banner._id || banner.id || `banner-${index}`,
        image:
          desktopImage || mobileImage || banner.imageUrl || banner.image || "",
        mobileImage: mobileImage || desktopImage || "",
        imageAlt:
          (typeof banner.desktopImage === "object"
            ? banner.desktopImage?.alt
            : "") ||
          (typeof banner.mobileImage === "object"
            ? banner.mobileImage?.alt
            : "") ||
          banner.title ||
          "CBNK fashion collection",
        smallText: banner.smallText || "",
        title: banner.title || "Discover Your Style",
        description: banner.description || "",
        ctaText: banner.ctaText || "",
        ctaLink: banner.ctaLink || "",
      };
    })
    .filter((banner) => banner.image);

  // API banners na milne par fallback use karein.
  const displayBanners = slides.length > 0 ? slides : defaultBanners;

  const [activeBanner, setActiveBanner] = useState(0);

  // Banners change hone par slider ko first slide par reset karein.
  useEffect(() => {
    setActiveBanner(0);
  }, [displayBanners.length]);

  // Har 5 seconds mein next slide.
  useEffect(() => {
    if (displayBanners.length <= 1) return undefined;

    const interval = setInterval(() => {
      setActiveBanner((current) =>
        current >= displayBanners.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [displayBanners.length]);

  const previousBanner = () => {
    setActiveBanner((current) =>
      current === 0 ? displayBanners.length - 1 : current - 1,
    );
  };

  const nextBanner = () => {
    setActiveBanner((current) =>
      current >= displayBanners.length - 1 ? 0 : current + 1,
    );
  };

  const currentBanner = displayBanners[activeBanner] || displayBanners[0];

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1200px] px-3 py-6 sm:px-5 sm:py-8 lg:px-0 lg:py-7">
        <div className="relative aspect-[2.12/1] min-h-[300px] w-full overflow-hidden bg-neutral-200 sm:min-h-[380px] lg:min-h-[500px]">
          {/* Banner images */}
          {displayBanners.map((banner, index) => (
            <picture key={banner.id}>
              {banner.mobileImage && (
                <source
                  media="(max-width: 767px)"
                  srcSet={banner.mobileImage}
                />
              )}

              <img
                src={banner.image}
                alt={banner.imageAlt || banner.title}
                loading={index === activeBanner ? "eager" : "lazy"}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  index === activeBanner ? "opacity-100" : "opacity-0"
                }`}
              />
            </picture>
          ))}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Previous button */}
          {displayBanners.length > 1 && (
            <button
              type="button"
              onClick={previousBanner}
              aria-label="Previous banner"
              className="absolute left-2 top-1/2 z-10 flex h-8 w-5 -translate-y-1/2 items-center justify-center bg-[#e5bd86] text-neutral-950 transition hover:bg-[#d9a968] sm:left-3"
            >
              <ChevronLeft size={22} strokeWidth={1.8} />
            </button>
          )}

          {/* Next button */}
          {displayBanners.length > 1 && (
            <button
              type="button"
              onClick={nextBanner}
              aria-label="Next banner"
              className="absolute right-2 top-1/2 z-10 flex h-8 w-5 -translate-y-1/2 items-center justify-center bg-[#e5bd86] text-neutral-950 transition hover:bg-[#d9a968] sm:right-3"
            >
              <ChevronRight size={22} strokeWidth={1.8} />
            </button>
          )}

          {/* Banner text */}
          <div className="absolute left-[9%] top-1/2 z-10 max-w-[80%] -translate-y-1/2 text-white sm:left-[5%]">
            {currentBanner.smallText && (
              <div className="inline-block bg-white px-3 py-1.5 sm:px-4 sm:py-2">
                <p className="text-[10px] font-bold tracking-[0.04em] text-[#1c3b52] sm:text-[14px]">
                  {currentBanner.smallText}
                </p>
              </div>
            )}

            {currentBanner.title && (
              <h1 className="mt-2 text-[30px] font-bold uppercase leading-none tracking-[0.01em] text-white drop-shadow-md sm:text-5xl lg:text-[56px]">
                {currentBanner.title}
              </h1>
            )}

            {currentBanner.description && (
              <p className="mt-3 max-w-xl text-sm text-white drop-shadow-md sm:text-base">
                {currentBanner.description}
              </p>
            )}

            {currentBanner.ctaText && currentBanner.ctaLink && (
              <a
                href={currentBanner.ctaLink}
                className="mt-5 inline-flex items-center gap-2 bg-[#e5bd86] px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-[#d9a968]"
              >
                {currentBanner.ctaText}
              </a>
            )}
          </div>

          {/* Slider dots */}
          {displayBanners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-4">
              {displayBanners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setActiveBanner(index)}
                  aria-label={`Go to banner ${index + 1}`}
                  aria-current={index === activeBanner ? "true" : undefined}
                  className={`h-[5px] transition-all duration-300 ${
                    index === activeBanner
                      ? "w-[20px] bg-[#d8b28a]"
                      : "w-[8px] bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
