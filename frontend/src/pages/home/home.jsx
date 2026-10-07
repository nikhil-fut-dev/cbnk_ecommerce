import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Truck, Cake, Star } from "lucide-react";

const Home = () => {
  // =========================================================
  // DUMMY BANNER DATA
  // Backend baad mein banayenge
  // =========================================================

  const banners = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=90",
      smallText: "YOUR WORLD",
      title: "YOUR STYLE",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1800&q=90",
      smallText: "NEW SEASON",
      title: "NEW LOOK",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=90",
      smallText: "CBNK COLLECTION",
      title: "OWN YOUR STYLE",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?auto=format&fit=crop&w=1800&q=90",
      smallText: "EVERYDAY EDIT",
      title: "LOOK YOUR BEST",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=90",
      smallText: "CBNK",
      title: "FIND YOUR FIT",
    },
  ];

  // =========================================================
  // STATE
  // =========================================================

  const [activeBanner, setActiveBanner] = useState(0);

  // =========================================================
  // CHARACTER MODE DUMMY DATA
  // Backend baad mein connect karenge
  // =========================================================

  const characterModes = [
    {
      id: 1,
      title: "Shop Men",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=90",
    },
    {
      id: 2,
      title: "Shop Women",
      image:
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=90",
    },
    {
      id: 3,
      title: "Shop Boys",
      image:
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=90",
    },
    {
      id: 4,
      title: "Shop Girls",
      image:
        "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=900&q=90",
    },
    {
      id: 5,
      title: "Shop Add-Ons",
      image:
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=90",
    },
  ];

  // =========================================================
  // CBNK ELITE DUMMY DATA
  // Backend baad mein connect karenge
  // =========================================================

  const eliteBenefits = [
    {
      id: 1,
      title: "Free Delivery",
      description: "On all orders, for 365 days!",
      icon: Truck,
    },
    {
      id: 2,
      title: "Birthday Vouchers",
      description: "For you & your loved one!",
      icon: Cake,
    },
    {
      id: 3,
      title: "Pre-sale Benefits",
      description: "Exclusive early access & more",
      icon: Star,
    },
  ];

  // =========================================================
  // NEW IN - KIDS SETS DUMMY DATA
  // Backend baad mein connect karenge
  // =========================================================

  const kidsSets = [
    {
      id: 1,
      title: "Boys (0-2 Yrs)",
      image:
        "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=700&q=90",
    },
    {
      id: 2,
      title: "Boys (2-8 Yrs)",
      image:
        "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&w=700&q=90",
    },
    {
      id: 3,
      title: "Boys (8-16 Yrs)",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=700&q=90",
    },
    {
      id: 4,
      title: "Girls (2-8 Yrs)",
      image:
        "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=700&q=90",
    },
    {
      id: 5,
      title: "Girls (0-2 Yrs)",
      image:
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=700&q=90",
    },
  ];

  // =========================================================
  // SLEEPWEAR EDIT DUMMY DATA
  // Backend baad mein connect karenge
  // =========================================================

  const sleepwearEdit = {
    desktopImage:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=90",

    mobileImage:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=90",

    smallText: "Comfort just got upgraded",
    title: "600+ Sleepwear Styles",
    price: "Starting at ₹399",
  };

  // =========================================================
  // POLO SHOP DUMMY DATA
  // Backend baad mein connect karenge
  // =========================================================

  const poloShop = {
    desktopImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=90",

    mobileImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=90",

    smallText: "The Polo Shop",
    title: "POLOS FOR EVERY OCCASION",
    price: "Starting at ₹399",
  };

  // =========================================================
  // AUTO SLIDER
  // =========================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((current) =>
        current === banners.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // =========================================================
  // PREVIOUS BANNER
  // =========================================================

  const previousBanner = () => {
    setActiveBanner((current) =>
      current === 0 ? banners.length - 1 : current - 1,
    );
  };

  // =========================================================
  // NEXT BANNER
  // =========================================================

  const nextBanner = () => {
    setActiveBanner((current) =>
      current === banners.length - 1 ? 0 : current + 1,
    );
  };

  const currentBanner = banners[activeBanner];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="w-full bg-white">
      {/* =====================================================
          PROMOTIONAL TICKER
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#56585a]">
        {/* diagonal pattern */}

        <div className="absolute inset-0 opacity-20">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0px, transparent 9px, #ffffff 9px, #ffffff 18px)",
            }}
          />
        </div>

        <div className="relative mx-auto flex h-[38px] max-w-[1200px] items-center justify-center overflow-hidden px-4">
          <div className="whitespace-nowrap text-center text-[11px] font-medium text-white sm:text-[13px]">
            Flat 300 off on 1999. Code:{" "}
            <span className="font-bold">CBNK300</span>
            <span className="mx-3 text-white/60">|</span>
            Flat 200 off on 1499. Code:{" "}
            <span className="font-bold">CBNK200</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          HERO BANNER
      ====================================================== */}

      <section className="w-full bg-white">
        <div className="mx-auto max-w-[1200px] px-3 py-6 sm:px-5 sm:py-8 lg:px-0 lg:py-7">
          <div className="relative aspect-[2.12/1] min-h-[300px] w-full overflow-hidden bg-neutral-200 sm:min-h-[380px] lg:min-h-[500px]">
            {/* =================================================
                BANNER IMAGE
            ================================================= */}

            {banners.map((banner, index) => (
              <img
                key={banner.id}
                src={banner.image}
                alt={banner.title}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  index === activeBanner ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            {/* =================================================
                DARK OVERLAY
            ================================================= */}

            <div className="absolute inset-0 bg-black/20" />

            {/* =================================================
                LEFT ARROW
            ================================================= */}

            <button
              type="button"
              onClick={previousBanner}
              aria-label="Previous banner"
              className="absolute left-2 top-1/2 z-10 flex h-8 w-5 -translate-y-1/2 items-center justify-center bg-[#e5bd86] text-neutral-950 transition hover:bg-[#d9a968] sm:left-3 sm:h-8 sm:w-5"
            >
              <ChevronLeft size={22} strokeWidth={1.8} />
            </button>

            {/* =================================================
                RIGHT ARROW
            ================================================= */}

            <button
              type="button"
              onClick={nextBanner}
              aria-label="Next banner"
              className="absolute right-2 top-1/2 z-10 flex h-8 w-5 -translate-y-1/2 items-center justify-center bg-[#e5bd86] text-neutral-950 transition hover:bg-[#d9a968] sm:right-3 sm:h-8 sm:w-5"
            >
              <ChevronRight size={22} strokeWidth={1.8} />
            </button>

            {/* =================================================
                BANNER TEXT
            ================================================= */}

            <div className="absolute left-[9%] top-1/2 z-10 -translate-y-1/2 text-white sm:left-[5%]">
              <div className="inline-block bg-white px-3 py-1.5 sm:px-4 sm:py-2">
                <p className="text-[10px] font-bold tracking-[0.04em] text-[#1c3b52] sm:text-[14px]">
                  {currentBanner.smallText}
                </p>
              </div>

              <h1 className="mt-2 text-[30px] font-bold uppercase leading-none tracking-[0.01em] text-white drop-shadow-md sm:text-5xl lg:text-[56px]">
                {currentBanner.title}
              </h1>
            </div>

            {/* =================================================
                SLIDER DOTS
            ================================================= */}

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-4">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setActiveBanner(index)}
                  aria-label={`Go to banner ${index + 1}`}
                  className={`h-[5px] transition-all duration-300 ${
                    index === activeBanner
                      ? "w-[20px] bg-[#d8b28a]"
                      : "w-[8px] bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CHARACTER MODE
      ====================================================== */}

      <section className="w-full bg-white [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto max-w-[1200px] px-3 py-5 sm:px-5 sm:py-7 lg:px-0">
          {/* =================================================
              SECTION TITLE
          ================================================== */}

          <div className="mb-2">
            <h2 className="inline-block text-[20px] font-bold leading-none text-black sm:text-[24px]">
              Character Mode: On
            </h2>

            <div className="mt-1 h-[4px] w-[50px] bg-[#d8b28a]" />
          </div>

          {/* =================================================
              CHARACTER CARDS
          ================================================== */}

          <div
            className="
              flex
              gap-3
              overflow-x-auto
              pb-3
              scroll-smooth
              scrollbar-hide
              snap-x
              snap-mandatory
              sm:gap-4
              lg:overflow-x-hidden
              [&::-webkit-scrollbar]:hidden
            "
          >
            {characterModes.map((character) => (
              <div
                key={character.id}
                className="
                  group
                  relative
                  h-[300px]
                  w-[210px]
                  shrink-0
                  cursor-pointer
                  overflow-hidden
                  bg-neutral-200
                  snap-start
                  sm:h-[320px]
                  sm:w-[230px]
                  lg:h-[320px]
                  lg:flex-1
                  lg:w-auto
                "
              >
                {/* =================================================
                    IMAGE
                ================================================== */}

                <img
                  src={character.image}
                  alt={character.title}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />

                {/* =================================================
                    DARK OVERLAY
                ================================================== */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                {/* =================================================
                    TITLE
                ================================================== */}

                <div className="absolute bottom-4 left-4 z-10">
                  <h3 className="text-[15px] font-bold text-white drop-shadow-md sm:text-[16px]">
                    {character.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* =====================================================
          CBNK ELITE MEMBERSHIP
      ====================================================== */}

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
          {/* =================================================
              DIAGONAL BACKGROUND
          ================================================== */}

          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0px, transparent 10px, rgba(255,255,255,0.025) 10px, rgba(255,255,255,0.025) 20px)",
            }}
          />

          {/* =================================================
              MAIN CONTENT
          ================================================== */}

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_230px] lg:items-center lg:gap-14">
            {/* =================================================
                LEFT CONTENT
            ================================================== */}

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
                  Unlock Savings Worth ₹1000+
                </h2>

                <div className="mt-2 h-[4px] w-[55px] bg-[#d8b28a]" />
              </div>

              {/* =================================================
                  BENEFITS
              ================================================== */}

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
                  const Icon = benefit.icon;

                  return (
                    <div
                      key={benefit.id}
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

                      {/* Text */}

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

            {/* =================================================
                ELITE MEMBERSHIP CARD
            ================================================== */}

            <div className="mx-auto w-full max-w-[220px] bg-black text-white">
              {/* Card Top */}

              <div className="px-4 pb-5 pt-5">
                {/* Logo */}

                <div className="mx-auto flex h-[60px] w-[145px] items-center justify-center overflow-hidden bg-[#F8F9F9]">
                  <img
                    src="/logo.png"
                    alt="CBNK"
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Elite */}

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
                  elite
                </h3>

                <p className="mt-2 text-center text-[8px] font-medium uppercase tracking-wide text-white">
                  NEW LOOK. NEW REWARDS.
                </p>

                {/* Price */}

                <div className="mt-5 text-center">
                  <p className="text-[12px] text-white/70 line-through">₹499</p>

                  <p className="mt-1 text-[27px] font-bold leading-none">
                    ₹249
                  </p>

                  <p className="mt-2 text-[10px] text-white">
                    Inclusive of all taxes
                  </p>
                </div>
              </div>

              {/* Validity */}

              <div className="mx-5 mb-5 bg-[#292929] py-2 text-center">
                <span className="text-[9px] font-semibold text-white">
                  Valid for 12 Months
                </span>
              </div>

              {/* CTA */}

              <button
                type="button"
                className="
                  mx-5
                  mb-5
                  block
                  w-[calc(100%-40px)]
                  bg-[#d8b28a]
                  py-2.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-black
                  transition
                  hover:bg-[#e1bd98]
                "
              >
                Join Elite
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* =====================================================
          NEW IN - KIDS SETS
      ====================================================== */}

      <section className="w-full bg-white [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto max-w-[1200px] px-3 py-5 sm:px-5 sm:py-7 lg:px-0">
          {/* =================================================
              SECTION TITLE
          ================================================== */}

          <div className="mb-2">
            <h2 className="inline-block text-[20px] font-bold leading-none text-black sm:text-[24px]">
              New In - Kids Sets
            </h2>

            <div className="mt-1 h-[4px] w-[50px] bg-[#d8b28a]" />
          </div>

          {/* =================================================
              KidsSets CARDS
          ================================================== */}

          <div
            className="
              flex
              gap-3
              overflow-x-auto
              pb-3
              scroll-smooth
              scrollbar-hide
              snap-x
              snap-mandatory
              sm:gap-4
              lg:overflow-x-hidden
              [&::-webkit-scrollbar]:hidden
            "
          >
            {kidsSets.map((item) => (
              <div
                key={item.id}
                className="
                  group
                  relative
                  h-[300px]
                  w-[210px]
                  shrink-0
                  cursor-pointer
                  overflow-hidden
                  bg-neutral-200
                  snap-start
                  sm:h-[320px]
                  sm:w-[230px]
                  lg:h-[320px]
                  lg:flex-1
                  lg:w-auto
                "
              >
                {/* =================================================
                    IMAGE
                ================================================== */}

                <img
                  src={item.image}
                  alt={item.title}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />

                {/* =================================================
                    DARK OVERLAY
                ================================================== */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                {/* =================================================
                    TITLE
                ================================================== */}

                <div className="absolute bottom-4 left-4 z-10">
                  <h3 className="text-[15px] font-bold text-white drop-shadow-md sm:text-[16px]">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* =====================================================
          SLEEPWEAR EDIT
      ====================================================== */}

      <section className="w-full bg-white">
        <div className="mx-auto max-w-[1200px] px-3 py-5 sm:px-5 sm:py-7 lg:px-0">
          {/* =================================================
              SECTION TITLE
          ================================================== */}

          <div className="mb-2">
            <h2 className="inline-block text-[20px] font-bold leading-none text-black sm:text-[24px]">
              Sleepwear Edit
            </h2>

            <div className="mt-1 h-[4px] w-[50px] bg-[#d8b28a]" />
          </div>

          {/* =================================================
              RESPONSIVE BANNER
          ================================================== */}

          <div className="relative w-full overflow-hidden bg-neutral-200">
            {/* =================================================
                DESKTOP / MOBILE IMAGE
            ================================================== */}

            <picture>
              {/* Mobile Image */}
              <source
                media="(max-width: 767px)"
                srcSet={sleepwearEdit.mobileImage}
              />

              {/* Desktop / Tablet Image */}
              <img
                src={sleepwearEdit.desktopImage}
                alt="Sleepwear Edit"
                className="
                  h-[260px]
                  w-full
                  object-cover
                  object-center
                  sm:h-[320px]
                  md:h-[380px]
                  lg:h-[500px]
                "
              />
            </picture>

            {/* =================================================
                DARK OVERLAY
            ================================================== */}

            <div className="absolute inset-0 bg-black/30" />

            {/* =================================================
                BANNER CONTENT
            ================================================== */}

            <div
              className="
                absolute
                left-[6%]
                top-1/2
                z-10
                -translate-y-1/2
                text-white
                sm:left-[7%]
                md:left-[6%]
              "
            >
              {/* Small Text */}

              <p
                className="
                  text-[13px]
                  font-semibold
                  leading-tight
                  text-white
                  drop-shadow-md
                  sm:text-[17px]
                  md:text-[21px]
                  lg:text-[26px]
                "
              >
                {sleepwearEdit.smallText}
              </p>

              {/* Main Title */}

              <h2
                className="
                  mt-2
                  text-[23px]
                  font-bold
                  leading-tight
                  text-white
                  drop-shadow-md
                  sm:mt-3
                  sm:text-[30px]
                  md:text-[38px]
                  lg:text-[44px]
                "
              >
                {sleepwearEdit.title}
              </h2>

              {/* Price */}

              <p
                className="
                  mt-2
                  text-[13px]
                  font-semibold
                  text-white
                  drop-shadow-md
                  sm:mt-3
                  sm:text-[17px]
                  md:text-[21px]
                  lg:text-[25px]
                "
              >
                {sleepwearEdit.price}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* =====================================================
    THE POLO SHOP
====================================================== */}

      <section className="w-full bg-white">
        <div className="mx-auto max-w-[1200px] px-3 py-5 sm:px-5 sm:py-7 lg:px-0">
          {/* =================================================
        SECTION TITLE
    ================================================== */}

          <div className="mb-2">
            <h2 className="inline-block text-[18px] font-bold leading-none text-black sm:text-[21px] lg:text-[24px]">
              {poloShop.smallText}
            </h2>

            <div className="mt-1 h-[4px] w-[50px] bg-[#d8b28a] sm:w-[55px]" />
          </div>

          {/* =================================================
        RESPONSIVE POLO BANNER
    ================================================== */}

          <div className="relative w-full overflow-hidden bg-neutral-200">
            {/* =================================================
          DESKTOP / MOBILE IMAGE
      ================================================= */}

            <picture>
              {/* Mobile Image */}
              <source
                media="(max-width: 767px)"
                srcSet={poloShop.mobileImage}
              />

              {/* Desktop / Tablet Image */}
              <img
                src={poloShop.desktopImage}
                alt="The Polo Shop"
                className="
            h-[190px]
            w-full
            object-cover
            object-center

            sm:h-[240px]
            md:h-[300px]
            lg:h-[390px]
            xl:h-[430px]
          "
              />
            </picture>

            {/* =================================================
          LEFT DARK SHADOW
      ================================================== */}

            <div
              className="
          absolute
          inset-y-0
          left-0
          w-[40%]
          bg-gradient-to-r
          from-black/60
          via-black/25
          to-transparent
        "
            />

            {/* =================================================
          BANNER CONTENT
      ================================================== */}

            <div
              className="
          absolute
          left-[5%]
          top-1/2
          z-10
          -translate-y-1/2
          text-white

          sm:left-[5%]
          md:left-[5%]
          lg:left-[4%]
        "
            >
              {/* =================================================
            MAIN TITLE
        ================================================== */}

              <h2
                className="
            max-w-[190px]
            text-[20px]
            font-bold
            uppercase
            leading-[1.05]
            tracking-tight
            text-white
            drop-shadow-lg

            sm:max-w-[280px]
            sm:text-[27px]

            md:max-w-[370px]
            md:text-[36px]

            lg:max-w-[500px]
            lg:text-[46px]

            xl:text-[52px]
          "
              >
                {poloShop.title}
              </h2>

              {/* =================================================
            PRICE
        ================================================== */}

              <p
                className="
            mt-2
            text-[12px]
            font-semibold
            text-white
            drop-shadow-md

            sm:mt-3
            sm:text-[14px]

            md:text-[17px]

            lg:mt-4
            lg:text-[20px]

            xl:text-[22px]
          "
              >
                {poloShop.price}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
