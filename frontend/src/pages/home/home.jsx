import { useEffect, useState } from "react";
import { Truck, Cake, Star } from "lucide-react";
import { getHomeData } from "../../services/homeApi";

import PromotionalTicker from "../../components/home/PromotionalTicker";
import HeroBanner from "../../components/home/HeroBanner";
import CharacterMode from "../../components/home/CharacterMode";

const Home = () => {
  // Promotional Ticker data
  const [promotionalTicker, setPromotionalTicker] = useState([]);

  // Hero Banner data
  const [heroBanners, setHeroBanners] = useState([]);

  // Character Mode data
  const [characterModes, setCharacterModes] = useState([]);

  // CBNK Elite Membership data
  const [eliteMembership, setEliteMembership] = useState(null);

  // Kids Sets data from backend
  const [kidsSets, setKidsSets] = useState([]);

  // Fetch Home page data from backend
  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        const response = await getHomeData();

        // Extract home data from API response
        const home = response?.home ?? response?.data?.home;

        if (!isMounted) return;

        // Set Promotional Ticker data
        setPromotionalTicker(
          Array.isArray(home?.promotionalTicker) ? home.promotionalTicker : [],
        );

        // Set Hero Banner data
        setHeroBanners(
          Array.isArray(home?.heroBanners) ? home.heroBanners : [],
        );

        // Set Character Mode data from backend
        setCharacterModes(
          Array.isArray(home?.characterModes) ? home.characterModes : [],
        );

        // Set CBNK Elite Membership data from backend
        setEliteMembership(
          home?.elite && typeof home.elite === "object" ? home.elite : null,
        );

        // Set Kids Sets data from backend
        setKidsSets(Array.isArray(home?.kidsSets) ? home.kidsSets : []);
      } catch (error) {
        console.error("Home page data fetch failed:", error);
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================================================
  // CBNK ELITE DATA FROM BACKEND
  // =========================================================

  const eliteIconMap = {
    truck: Truck,
    cake: Cake,
    star: Star,
    gift: Cake,
  };

  const eliteBenefits = Array.isArray(eliteMembership?.benefits)
    ? [...eliteMembership.benefits].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      )
    : [];

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
  // RENDER
  // =========================================================

  return (
    <main className="w-full bg-white">
      {/* =====================================================
          PROMOTIONAL TICKER
      ====================================================== */}

      <PromotionalTicker items={promotionalTicker} />

      {/* =====================================================
          HERO BANNER
      ====================================================== */}

      <HeroBanner banners={heroBanners} />

      {/* =====================================================
          CHARACTER MODE
      ====================================================== */}

      <CharacterMode characters={characterModes} />

      {/* =====================================================
          CBNK ELITE MEMBERSHIP
      ====================================================== */}

      {eliteMembership && (
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
                    {eliteMembership?.subtitle ||
                      eliteMembership?.title ||
                      "CBNK Elite Membership"}
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
                    const Icon =
                      eliteIconMap[benefit.icon?.toLowerCase()] ?? Star;

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
                      src={eliteMembership?.logo?.url || "/logo.png"}
                      alt={eliteMembership?.logo?.alt || "CBNK Elite"}
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
                    {eliteMembership?.title || "elite"}
                  </h3>

                  <p className="mt-2 text-center text-[8px] font-medium uppercase tracking-wide text-white">
                    {eliteMembership?.description ||
                      eliteMembership?.subtitle ||
                      "NEW LOOK. NEW REWARDS."}
                  </p>

                  {/* Price */}

                  <div className="mt-5 text-center">
                    <p className="text-[12px] text-white/70 line-through">
                      ₹
                      {Number(
                        eliteMembership?.originalPrice ?? 0,
                      ).toLocaleString("en-IN")}
                    </p>

                    <p className="mt-1 text-[27px] font-bold leading-none">
                      ₹
                      {Number(
                        eliteMembership?.sellingPrice ?? 0,
                      ).toLocaleString("en-IN")}
                    </p>

                    <p className="mt-2 text-[10px] text-white">
                      {eliteMembership?.taxText || "Inclusive of all taxes"}
                    </p>
                  </div>
                </div>

                {/* Validity */}

                <div className="mx-5 mb-5 bg-[#292929] py-2 text-center">
                  <span className="text-[9px] font-semibold text-white">
                    {eliteMembership?.validityText ||
                      `Valid for ${eliteMembership?.validityMonths ?? 12} Months`}
                  </span>
                </div>

                {/* CTA */}

                <a
                  href={eliteMembership?.ctaLink || "#"}
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
                  {eliteMembership?.ctaText || "Join Elite"}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
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
                key={item._id || item.id}
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
                  src={item.image?.url || "/placeholder.png"}
                  alt={item.image?.alt || item.title}
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
