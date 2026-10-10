const CharacterMode = ({ characters = [] }) => {
  return (
    <section className="w-full bg-white [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto max-w-[1200px] px-3 py-5 sm:px-5 sm:py-7 lg:px-0">
        {/* Section title */}
        <div className="mb-2">
          <h2 className="inline-block text-[20px] font-bold leading-none text-black sm:text-[24px]">
            Character Mode: On
          </h2>

          <div className="mt-1 h-[4px] w-[50px] bg-[#d8b28a]" />
        </div>

        {/* Character cards */}
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
          {characters.map((character) => {
            // Backend image is an object: { url, publicId, alt }
            const imageUrl =
              typeof character.image === "string"
                ? character.image
                : character.image?.url;

            const imageAlt =
              typeof character.image === "object" ? character.image?.alt : "";

            return (
              <div
                key={character._id || character.id}
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
                {/* Backend Image */}
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={imageAlt || character.title || "Character Mode"}
                    loading="lazy"
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-105
                    "
                    onError={(event) => {
                      console.error(
                        "Character Mode image failed to load:",
                        imageUrl,
                      );

                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                    Image unavailable
                  </div>
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                {/* Title */}
                <div className="absolute bottom-4 left-4 z-10">
                  <h3 className="text-[15px] font-bold text-white drop-shadow-md sm:text-[16px]">
                    {character.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {characters.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-500">
            No character modes are currently available.
          </p>
        )}
      </div>
    </section>
  );
};

export default CharacterMode;
