import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#f7f7f7] text-[#111111]">
      {/* =====================================================
          FOOTER MAIN SECTION
      ====================================================== */}

      <div className="w-full px-6 py-12 sm:px-8 sm:py-14 md:px-10 lg:px-12 xl:px-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* =================================================
              COLUMN 1 - JOIN CBNK FAMILY
          ================================================== */}

          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-[18px] font-bold leading-tight">
              Join CBNK Family
            </h2>

            <p className="mt-4 max-w-[390px] text-[14px] leading-[1.45] text-[#333333]">
              Enjoy member-only discounts & offers, early access to sale and
              much more.
            </p>

            <button
              type="button"
              className="
                mt-4
                rounded-full
                bg-black
                px-5
                py-2.5
                text-[13px]
                font-bold
                text-white
                transition
                duration-200
                hover:bg-[#333333]
              "
            >
              Join the club
            </button>

            {/* Business Network */}

            <div className="mt-12">
              <h2 className="text-[18px] font-bold leading-tight">
                CBNK Business Network
              </h2>

              <p className="mt-4 max-w-[390px] text-[14px] leading-[1.45] text-[#333333]">
                Join the membership program for business customers with exciting
                benefits.
              </p>

              <button
                type="button"
                className="
                  mt-4
                  rounded-full
                  bg-black
                  px-5
                  py-2.5
                  text-[13px]
                  font-bold
                  text-white
                  transition
                  duration-200
                  hover:bg-[#333333]
                "
              >
                Join now
              </button>
            </div>
          </div>

          {/* =================================================
              COLUMN 2 - CBNK FAMILY
          ================================================== */}

          <div>
            <h3 className="text-[17px] font-bold">CBNK Family</h3>

            <ul className="mt-4 space-y-2 text-[14px] text-[#222222]">
              <li>
                <button type="button" className="transition hover:underline">
                  Log in
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Join CBNK Family
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Member offers
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Workshops & Events
                </button>
              </li>
            </ul>
          </div>

          {/* =================================================
              COLUMN 3 - SERVICES
          ================================================== */}

          <div>
            <h3 className="text-[17px] font-bold">Services</h3>

            <ul className="mt-4 space-y-2 text-[14px] text-[#222222]">
              <li>
                <button type="button" className="transition hover:underline">
                  Delivery Service
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Click & Collect
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Personal Shopper
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Online Planning
                </button>
              </li>
            </ul>
          </div>

          {/* =================================================
              COLUMN 4 - HELP
          ================================================== */}

          <div>
            <h3 className="text-[17px] font-bold">Help</h3>

            <ul className="mt-4 space-y-2 text-[14px] text-[#222222]">
              <li>
                <button type="button" className="transition hover:underline">
                  How to shop
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Return policy
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Contact us
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  FAQ&apos;s
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Terms and conditions
                </button>
              </li>
            </ul>
          </div>

          {/* =================================================
              COLUMN 5 - ABOUT CBNK
          ================================================== */}

          <div>
            <h3 className="text-[17px] font-bold">About CBNK</h3>

            <ul className="mt-4 space-y-2 text-[14px] text-[#222222]">
              <li>
                <button type="button" className="transition hover:underline">
                  This is CBNK
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Careers at CBNK
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  Sustainability
                </button>
              </li>

              <li>
                <button type="button" className="transition hover:underline">
                  CBNK Stores
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* =====================================================
          DIVIDER
      ====================================================== */}

      <div className="mx-6 border-t border-[#d8d8d8] sm:mx-8 md:mx-10 lg:mx-12 xl:mx-14" />

      {/* =====================================================
          BOTTOM FOOTER
      ====================================================== */}

      <div
        className="
          flex
          w-full
          flex-col
          gap-6
          px-6
          py-6
          sm:px-8
          md:px-10
          lg:flex-row
          lg:items-center
          lg:justify-between
          lg:px-12
          xl:px-14
        "
      >
        {/* Copyright */}

        <div className="text-[14px] text-[#111111]">
          © Inter CBNK Systems B.V. 2026
        </div>

        {/* =================================================
            SOCIAL ICONS
        ================================================== */}

        <div className="flex items-center gap-5">
          {/* GitHub */}

          <button
            type="button"
            aria-label="GitHub"
            className="flex h-7 w-7 items-center justify-center transition hover:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 fill-black"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.35 1.12 2.93.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.2 9.2 0 0 1 12 6.98c.85 0 1.7.12 2.5.36 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
            </svg>
          </button>

          {/* Instagram */}

          <button
            type="button"
            aria-label="Instagram"
            className="flex h-7 w-7 items-center justify-center transition hover:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 fill-none stroke-black"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />

              <circle cx="12" cy="12" r="4" />

              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                className="fill-black stroke-none"
              />
            </svg>
          </button>

          {/* Twitter / X */}

          <button
            type="button"
            aria-label="X"
            className="flex h-7 w-7 items-center justify-center transition hover:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 fill-black"
              aria-hidden="true"
            >
              <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.4L6.47 22H3.36l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.9h1.73L8.26 3.98H6.4L17.8 19.9Z" />
            </svg>
          </button>
        </div>

        {/* =================================================
            LEGAL LINKS
        ================================================== */}

        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] text-[#222222] lg:justify-end">
          <button type="button" className="hover:underline">
            Privacy policy
          </button>

          <button type="button" className="hover:underline">
            Cookie policy
          </button>

          <button type="button" className="hover:underline">
            Cookie settings
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
