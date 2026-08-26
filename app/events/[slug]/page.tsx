"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSyncExternalStore } from "react";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Ticket,
  User,
} from "lucide-react";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import TicketSelection from "@/components/events/TicketSelection";

import {
  getPublicEvents,
  subscribeToEventDrafts,
} from "@/lib/dashboard/eventDraft";

import type { Event } from "@/lib/data/event";

/* =========================================================
   SERVER SNAPSHOT
========================================================= */

const EMPTY_EVENTS: Event[] = [];

function getServerEvents(): Event[] {
  return EMPTY_EVENTS;
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
      weekday: "long",
      day: "numeric",
      month: "long",
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
   PAGE
========================================================= */

export default function EventDetailsPage() {
  const params = useParams();

  const slug =
    typeof params.slug === "string"
      ? decodeURIComponent(params.slug)
      : "";

  const publicEvents =
    useSyncExternalStore(
      subscribeToEventDrafts,
      getPublicEvents,
      getServerEvents
    );

  const event =
    publicEvents.find(
      (item) =>
        item.slug?.trim().toLowerCase() ===
        slug.trim().toLowerCase()
    );

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!event) {
    return (
      <main className="min-h-screen bg-[#F7F7F7]">
        <Navbar />

        <section className="flex min-h-[60vh] items-center justify-center px-5">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#432616]/10">
              <Ticket
                size={28}
                className="text-[#432616]"
              />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-[#241507]">
              Event not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This event may have been removed,
              unpublished, or the link may be
              invalid.
            </p>

            <Link
              href="/events"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#432616] px-6 font-semibold text-white transition hover:bg-[#2f1a0e]"
            >
              Browse Events
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  /* =======================================================
     EVENT DATA
  ======================================================= */

  const title =
    event.title?.trim() ||
    "Untitled Event";

  const location =
    event.location?.trim() ||
    event.venue?.trim() ||
    "Location not set";

  const time =
    event.time?.trim() ||
    event.startTime?.trim() ||
    "Time not set";

  const firstTicket =
    Array.isArray(event.tickets) &&
    event.tickets.length > 0
      ? event.tickets[0]
      : null;

  const price =
    Number(firstTicket?.price) || 0;

  const image =
    typeof event.image === "string" &&
    event.image.trim().length > 0
      ? event.image
      : null;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-10">

        {/* BACK */}

        <Link
          href="/events"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#432616] transition hover:opacity-70"
        >
          <ArrowLeft size={18} />

          Back to events
        </Link>

        {/* EVENT */}

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

          {/* IMAGE */}

          <div className="relative h-[260px] w-full bg-[#F5F3F1] sm:h-[350px] md:h-[500px]">

            {image ? (
              <Image
                src={image}
                alt={`${title} event image`}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#432616]/10">
                    <CalendarDays
                      size={30}
                      className="text-[#432616]"
                    />
                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-500">
                    No event image
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CONTENT */}

          <div className="p-5 sm:p-7 md:p-10">

            {/* CATEGORY + PRICE */}

            <div className="flex flex-wrap items-center justify-between gap-3">

              <span className="rounded-full bg-[#432616]/10 px-4 py-2 text-xs font-semibold text-[#432616]">
                {formatCategory(
                  event.category
                )}
              </span>

              <span className="rounded-full bg-[#432616] px-4 py-2 text-sm font-bold text-white">
                {formatPrice(price)}
              </span>
            </div>

            {/* TITLE */}

            <h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-tight text-[#241507] sm:text-4xl md:text-5xl">
              {title}
            </h1>

            {/* DESCRIPTION */}

            {event.description?.trim() && (
              <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-7 text-gray-600">
                {event.description}
              </p>
            )}

            {/* DETAILS */}

            <div className="mt-8 grid gap-4 border-t border-gray-100 pt-8 sm:grid-cols-2 lg:grid-cols-4">

              {/* DATE */}

              <div className="rounded-2xl bg-[#F8F6F4] p-5">
                <CalendarDays
                  size={21}
                  className="text-[#432616]"
                />

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Date
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-[#241507]">
                  {formatDate(event.date)}
                </p>
              </div>

              {/* TIME */}

              <div className="rounded-2xl bg-[#F8F6F4] p-5">
                <Clock3
                  size={21}
                  className="text-[#432616]"
                />

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Time
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-[#241507]">
                  {time}
                </p>
              </div>

              {/* LOCATION */}

              <div className="rounded-2xl bg-[#F8F6F4] p-5">
                <MapPin
                  size={21}
                  className="text-[#432616]"
                />

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Location
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-[#241507]">
                  {location}
                </p>
              </div>

              {/* ORGANIZER */}

              <div className="rounded-2xl bg-[#F8F6F4] p-5">
                <User
                  size={21}
                  className="text-[#432616]"
                />

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Organizer
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-[#241507]">
                  {event.organizer?.name ||
                    "Organizer"}
                </p>
              </div>
            </div>

            {/* =======================================================
    TICKETS
======================================================= */}

{event.tickets &&
  event.tickets.length > 0 && (
    <section
      id="tickets"
      className="mt-10 scroll-mt-24 border-t border-gray-100 pt-8"
    >
      <div className="flex items-center gap-3">
        <Ticket
          size={22}
          className="text-[#432616]"
        />

        <div>
          <h2 className="text-xl font-bold text-[#241507]">
            Select your tickets
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose the tickets you want to purchase.
          </p>
        </div>
      </div>

      <TicketSelection
       tickets={event.tickets}
       eventSlug={event.slug}
      />
    </section>
  )}
            {/* ACTION */}

            <div className="mt-8 border-t border-gray-100 pt-8">
           <button
            type="button"
        onClick={() =>
          document
            .getElementById("tickets")
          ?.scrollIntoView({
          behavior: "smooth",
       })
         }
         className="flex h-12 w-full items-center justify-center rounded-xl bg-[#432616] px-6 font-semibold text-white transition hover:bg-[#2f1a0e] sm:w-auto" 
             >
         Get Tickets
      </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}