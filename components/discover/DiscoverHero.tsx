import Image from "next/image";

export default function DiscoverHero() {
  return (
    <section className="relative h-[260px] md:h-[420px] overflow-hidden">
      <Image
        src="/images/event.jpg"
        alt="Discover Events"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-6">
          <h1 className="text-4xl md:text-6xl font-bold">
            Discover Events
          </h1>

          <p className="mt-5 max-w-xl text-base md:text-lg text-white/90">
            Find concerts, conferences, festivals, sports and many more happening around you.
          </p>
        </div>
      </div>
    </section>
  );
}