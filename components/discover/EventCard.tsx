import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin } from "lucide-react";

import { Event } from "@/lib/data/event";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/event/${event.slug}`}
      className="group block overflow-hidden rounded-[28px] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Desktop */}
      <div className="hidden md:flex">
        {/* Image */}

        <div className="relative h-[220px] w-[320px] shrink-0 overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}

        <div className="flex flex-1 flex-col justify-between p-8">
          <div>
            <span className="inline-flex rounded-full bg-[#F7EFE8] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#8B6045]">
              {event.category.replace("-", " ")}
            </span>

            <h3 className="mt-4 text-3xl font-bold text-[#241507]">
              {event.title}
            </h3>

            <p className="mt-4 line-clamp-2 text-gray-600">
              {event.description}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} />
              {event.date}
            </div>

            <div className="flex items-center gap-2">
              <Clock3 size={18} />
              {event.time}
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={18} />
              {event.location}
            </div>
          </div>
        </div>

        {/* Price */}

        <div className="flex min-w-[170px] flex-col items-center justify-center border-l border-gray-100 p-8">
          <p className="text-sm text-gray-500">
            Ticket From
          </p>

          <h4 className="mt-2 text-3xl font-bold text-[#8B6045]">
            {event.price}
          </h4>
        </div>
      </div>

      {/* Mobile */}

      <div className="md:hidden">
        <div className="relative h-56 w-full">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-5">
          <span className="inline-flex rounded-full bg-[#F7EFE8] px-3 py-1 text-xs font-semibold text-[#8B6045]">
            {event.category.replace("-", " ")}
          </span>

          <h3 className="mt-3 text-2xl font-bold text-[#241507]">
            {event.title}
          </h3>

          <p className="mt-3 line-clamp-2 text-gray-600">
            {event.description}
          </p>

          <div className="mt-5 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              {event.date}
            </div>

            <div className="flex items-center gap-2">
              <Clock3 size={16} />
              {event.time}
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {event.location}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Ticket From
              </p>

              <h4 className="text-2xl font-bold text-[#8B6045]">
                {event.price}
              </h4>
            </div>

            <span className="rounded-full bg-[#241507] px-5 py-2 text-sm font-semibold text-white">
              View Event
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}