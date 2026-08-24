import Image from "next/image";

import { Event } from "@/lib/data/event";

interface Props {
  event: Event;
}

export default function EventHero({
  event,
}: Props) {
  return (
    <section className="relative h-[260px] overflow-hidden md:h-[420px]">

      <Image
        src={event.image}
        alt={event.title}
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 flex items-end">

        <div className="mx-auto w-full max-w-7xl px-5 pb-10 md:px-8">

          <span className="rounded-full bg-[#8B6045] px-4 py-2 text-sm text-white">

            {event.category}

          </span>

          <h1 className="mt-5 max-w-3xl text-3xl font-bold text-white md:text-5xl">

            {event.title}

          </h1>

        </div>

      </div>

    </section>
  );
}