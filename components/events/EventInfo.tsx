import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import { Event } from "@/lib/data/event";

interface Props {
  event: Event;
}

export default function EventInfo({
  event,
}: Props) {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-5 md:px-8">

      <h1 className="text-4xl font-bold">
        {event.title}
      </h1>

      <div className="mt-8 space-y-5">

        <div className="flex items-center gap-3">
          <CalendarDays />

          <span>{event.date}</span>
        </div>

        <div className="flex items-center gap-3">
          <Clock3 />

          <span>{event.time}</span>
        </div>

        <div className="flex items-center gap-3">
          <MapPin />

          <span>{event.location}</span>
        </div>

      </div>

      <div className="mt-10">

        <h2 className="text-xl font-semibold">
          About this event
        </h2>

        <p className="mt-5 max-w-3xl leading-8 text-gray-600">
          {event.description}
        </p>

      </div>

      <div className="mt-10">
        <span className="font-semibold">
          Ticket Price:
        </span>

        <span className="ml-2">
          {event.price}
        </span>
      </div>

    </section>
  );
}