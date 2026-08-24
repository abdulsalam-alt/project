"use client";

import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";

import EventCard from "./EventCard";
import EventSearch from "./EventSearch";

import { Event } from "@/lib/data/event";

interface UpcomingEventsProps {
  events: Event[];

  searchQuery: string;
  onSearchChange: React.Dispatch<React.SetStateAction<string>>;

  selectedLocation: string;
  onLocationChange: React.Dispatch<React.SetStateAction<string>>;
}

export default function UpcomingEvents({
  events,
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
}: UpcomingEventsProps) {
  return (
    <section className="bg-[#F8F8F8] py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Heading */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl font-bold text-[#241507]">
            Upcoming Events
          </h2>

          <Link
            href="/event"
            className="rounded-full border border-[#241507] px-6 py-3 font-semibold text-[#241507] transition hover:bg-[#241507] hover:text-white"
          >
            View All
          </Link>
        </div>

        {/* Search & Location */}

        <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-xl">
            <EventSearch
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>

          <div className="relative w-full lg:w-64">
            <MapPin
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6045]"
            />

            <select
              value={selectedLocation}
              onChange={(e) =>
                onLocationChange(e.target.value)
              }
              className="h-12 w-full appearance-none rounded-full border border-gray-300 bg-white pl-11 pr-10 text-sm outline-none"
            >
              <option value="all">All Locations</option>
              <option value="Ikoyi">Ikoyi</option>
              <option value="Lekki">Lekki</option>
              <option value="Ajah">Ajah</option>
              <option value="Ikeja">Ikeja</option>
              <option value="Yaba">Yaba</option>
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        {/* Events */}

        <div className="mt-12 space-y-6">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard
                key={event.slug}
                event={event}
              />
            ))
          ) : (
            <div className="rounded-3xl bg-white py-20 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-[#241507]">
                No events found
              </h3>

              <p className="mt-3 text-gray-500">
                Try another category, location or search keyword.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}