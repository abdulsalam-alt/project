"use client";

interface Props {
  location: string;
}

export default function EventLocation({
  location,
}: Props) {
  return (
    <section className="mx-auto mt-14 max-w-7xl px-5 md:px-8">

      <h2 className="mb-5 text-xl font-semibold">
        Direction
      </h2>

      <div className="overflow-hidden rounded-3xl">

        <iframe
          title={location}
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            location
          )}&output=embed`}
          loading="lazy"
          className="h-[350px] w-full border-0"
        />

      </div>

    </section>
  );
}