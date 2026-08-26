"use client";

import Image from "next/image";
import Link from "next/link";

import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import type { Event } from "@/lib/data/event";

interface EventCardProps {
  event: Event;
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  date?: string
): string {
  if (!date || !date.trim()) {
    return "Date not set";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  price: number
): string {
  const numericPrice =
    Number(price) || 0;

  if (numericPrice <= 0) {
    return "Free";
  }

  return `₦${numericPrice.toLocaleString(
    "en-NG"
  )}`;
}

/* =========================================================
   CATEGORY
========================================================= */

function formatCategory(
  category?: string
): string {
  if (!category) {
    return "Community";
  }

  return category
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

/* =========================================================
   PLACEHOLDER
========================================================= */

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#F5F3F1]">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#432616]/10">
          <CalendarDays
            size={26}
            className="text-[#432616]"
          />
        </div>

        <p className="mt-3 text-sm font-medium text-gray-500">
          No image
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   EVENT CARD
========================================================= */

export default function EventCard({
  event,
}: EventCardProps) {
  /*
   * Never pass an empty string to Next/Image.
   */
  const image =
    typeof event.image === "string" &&
    event.image.trim().length > 0
      ? event.image
      : null;

  /*
   * Prefer slug.
   *
   * If slug is missing, use ID.
   *
   * If both are missing, don't create
   * a broken event URL.
   */
  const eventIdentifier =
    typeof event.slug === "string" &&
    event.slug.trim().length > 0
      ? event.slug.trim()
      : typeof event.id === "string" &&
          event.id.trim().length > 0
        ? event.id.trim()
        : null;

  const firstTicket =
    Array.isArray(event.tickets) &&
    event.tickets.length > 0
      ? event.tickets[0]
      : null;

  const price =
    Number(firstTicket?.price) || 0;

  const title =
    event.title?.trim() ||
    "Untitled Event";

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* =================================================
          DESKTOP IMAGE
      ================================================= */}

      <div className="hidden md:block">
        <div className="relative h-[220px] w-full overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={`${title} event image`}
              fill
              sizes="(max-width: 1024px) 50vw, 320px"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
      </div>

      {/* =================================================
          MOBILE IMAGE
      ================================================= */}

      <div className="md:hidden">
        <div className="relative h-56 w-full overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={`${title} event image`}
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-5">
        {/* =================================================
            TITLE + PRICE
        ================================================= */}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-[#241507]">
              {title}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {formatCategory(
                event.category
              )}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-[#432616]/10 px-3 py-1 text-xs font-semibold text-[#432616]">
            {formatPrice(price)}
          </span>
        </div>

        {/* =================================================
            DETAILS
        ================================================= */}

        <div className="mt-5 space-y-3">
          {/* DATE */}

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CalendarDays
              size={17}
              className="shrink-0 text-[#432616]"
            />

            <span>
              {formatDate(event.date)}
            </span>
          </div>

          {/* TIME */}

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock3
              size={17}
              className="shrink-0 text-[#432616]"
            />

            <span>
              {event.time?.trim() ||
                event.startTime?.trim() ||
                "Time not set"}
            </span>
          </div>

          {/* LOCATION */}

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin
              size={17}
              className="shrink-0 text-[#432616]"
            />

            <span className="truncate">
              {event.location?.trim() ||
                event.venue?.trim() ||
                "Location not set"}
            </span>
          </div>
        </div>

        {/* =================================================
            VIEW EVENT
        ================================================= */}

        <div className="mt-6 border-t border-gray-100 pt-4">
          {eventIdentifier ? (
            <Link
              href={`/events/${encodeURIComponent(
                eventIdentifier
              )}`}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-300 font-semibold text-[#432616] transition hover:bg-[#432616] hover:text-white"
            >
              View Event
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-11 w-full cursor-not-allowed items-center justify-center rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-400"
            >
              Event unavailable
            </button>
          )}
        </div>
      </div>
    </article>
  );
}