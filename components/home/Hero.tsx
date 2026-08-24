import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[540px] overflow-hidden sm:h-[620px] lg:h-[760px]">
      {/* Background Image */}
      <Image
        src="/images/hero.png"
        alt="Hero Background"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">

          {/* Heading */}
          <h1
            className="
              max-w-xs
              text-[32px]
              font-bold
              leading-tight
              text-white

              sm:max-w-md
              sm:text-5xl

              lg:max-w-3xl
              lg:text-6xl
            "
          >
            Find events happening around you
          </h1>

          {/* Subtitle */}
          <p
            className="
              mt-5
              max-w-xs
              text-sm
              leading-6
              text-white/80

              sm:max-w-md

              lg:max-w-xl
              lg:text-lg
            "
          >
            We help you find events that match
            <br />
            your vibe in just one click
          </p>

          {/* CTA Button */}
          <Link
            href="/discover"
            className="
              mt-8
              flex
              h-14
              w-full
              max-w-[340px]
              items-center
              justify-center
              rounded-full
              bg-[#8B6045]
              text-base
              font-medium
              text-white
              shadow-xl
              transition-all
              duration-300
              hover:scale-[1.02]
              hover:bg-[#9B6B4E]

              lg:h-16
              lg:max-w-[420px]
              lg:text-lg
            "
          >
            Discover events
          </Link>

        </div>
      </div>
    </section>
  );
}