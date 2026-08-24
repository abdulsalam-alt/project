import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin } from "lucide-react";

import { Event } from "@/lib/data/event";

interface EventListCardProps {
  event: Event;
}

export default function EventListCard({
  event,
}: EventListCardProps) {
  return (
    <Link
      href={`/event/${event.slug}`}
      className="
        group
        block
        overflow-hidden
        rounded-3xl
        border
        border-gray-200
        bg-white
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div className="flex gap-5 p-5">

        {/* Image */}

        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}

        <div className="flex flex-1 flex-col">

          <h3 className="text-lg font-semibold text-[#241507]">
            {event.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">

            <div className="flex items-center gap-1">
              <CalendarDays size={15} />
              {event.date}
            </div>

            <div className="flex items-center gap-1">
              <Clock3 size={15} />
              {event.time}
            </div>

            <div className="flex items-center gap-1">
              <MapPin size={15} />
              {event.location}
            </div>

          </div>

          <div className="mt-4">
            <span className="text-lg font-bold text-[#8B6045]">
              {event.price}
            </span>
          </div>

        </div>

      </div>
    </Link>
  );
}