"use client";

import {
  CalendarDays,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  deleteOrganizerEvent,
  getCurrentOrganizerEvents,
  getServerEvents,
  subscribeToEventDrafts,
  type EventDraft,
} from "@/lib/dashboard/eventDraft";

import type { EventStatus } from "@/lib/data/event";

/* =========================================================
   TABS
========================================================= */

const TABS: {
  label: string;
  value: "all" | EventStatus;
}[] = [
  {
    label: "All Events",
    value: "all",
  },
  {
    label: "Published",
    value: "published",
  },
  {
    label: "Pending Review",
    value: "pending-review",
  },
  {
    label: "Drafts",
    value: "draft",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
  {
    label: "Ended",
    value: "ended",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function OrganizerEventsPage() {
  const events = useSyncExternalStore(
    subscribeToEventDrafts,
    getCurrentOrganizerEvents,
    getServerEvents
  );

  const [activeTab, setActiveTab] =
    useState<"all" | EventStatus>("all");

  /* =======================================================
     FILTER EVENTS
  ======================================================= */

  const filteredEvents = useMemo(() => {
    if (activeTab === "all") {
      return events;
    }

    return events.filter(
      (event) =>
        event.status === activeTab
    );
  }, [events, activeTab]);

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>
          <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
            My Events
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Manage and track all your events.
          </p>
        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="mt-7 overflow-x-auto border-b border-gray-200">
          <div className="flex min-w-max gap-6">

            {TABS.map((tab) => {
              const isActive =
                activeTab === tab.value;

              const count =
                tab.value === "all"
                  ? events.length
                  : events.filter(
                      (event) =>
                        event.status ===
                        tab.value
                    ).length;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.value)
                  }
                  className={`relative whitespace-nowrap pb-4 text-sm font-semibold transition ${
                    isActive
                      ? "text-[#432616]"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}

                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-[#432616] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#432616]" />
                  )}
                </button>
              );
            })}

          </div>
        </div>

        {/* =================================================
            EVENT LIST
        ================================================= */}

        <div className="mt-7">
          {filteredEvents.length === 0 ? (
            <EmptyEvents
              activeTab={activeTab}
            />
          ) : (
            <div className="grid gap-5">
              {filteredEvents.map(
                (event) => (
                  <OrganizerEventCard
                    key={event.id}
                    event={event}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyEvents({
  activeTab,
}: {
  activeTab:
    | "all"
    | EventStatus;
}) {
  let title = "No events yet";

  if (activeTab === "published") {
    title = "No published events";
  }

  if (activeTab === "pending-review") {
    title = "No events waiting for review";
  }

  if (activeTab === "draft") {
    title = "No draft events";
  }

  if (activeTab === "rejected") {
    title = "No rejected events";
  }

  if (activeTab === "ended") {
    title = "No ended events";
  }

  if (activeTab === "cancelled") {
    title = "No cancelled events";
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
      <CalendarDays
        size={44}
        className="mx-auto text-gray-400"
      />

      <h2 className="mt-5 text-lg font-semibold text-[#241507]">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        Events matching this status
        will appear here.
      </p>
    </div>
  );
}

/* =========================================================
   EVENT CARD
========================================================= */

function OrganizerEventCard({
  event,
}: {
  event: EventDraft;
}) {
  const statusStyles: Record<
    EventStatus,
    string
  > = {
    draft:
      "bg-gray-100 text-gray-700",

    "pending-review":
      "bg-amber-50 text-amber-700",

    published:
      "bg-green-50 text-green-700",

    rejected:
      "bg-red-50 text-red-700",

    ended:
      "bg-purple-50 text-purple-700",

    cancelled:
      "bg-gray-100 text-gray-600",
  };

  const statusLabels: Record<
    EventStatus,
    string
  > = {
    draft: "Draft",

    "pending-review":
      "Pending Review",

    published:
      "Published",

    rejected:
      "Rejected",

    ended:
      "Ended",

    cancelled:
      "Cancelled",
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = () => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${event.title}"?`
      );

    if (!confirmed) {
      return;
    }

    deleteOrganizerEvent(event.id);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

      <div className="flex flex-col md:flex-row">

        {/* =================================================
            EVENT IMAGE
        ================================================= */}

        <div className="w-full md:w-[280px] md:shrink-0">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="h-56 w-full object-cover md:h-full"
            />
          ) : (
            <div className="flex h-56 items-center justify-center bg-gray-100 text-sm text-gray-400 md:h-full">
              No image
            </div>
          )}
        </div>

        {/* =================================================
            EVENT CONTENT
        ================================================= */}

        <div className="flex-1 p-5 sm:p-7">

          {/* =================================================
              TITLE + STATUS
          ================================================= */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-[#241507]">
                {event.title ||
                  "Untitled Event"}
              </h2>

              {event.category && (
                <p className="mt-1 text-sm capitalize text-gray-500">
                  {String(
                    event.category
                  ).replace(
                    /-/g,
                    " "
                  )}
                </p>
              )}
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[
                  event.status
                ]
              }`}
            >
              {
                statusLabels[
                  event.status
                ]
              }
            </span>

          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          {event.description && (
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
              {event.description}
            </p>
          )}

          {/* =================================================
              EVENT INFORMATION
          ================================================= */}

          <div className="mt-5 grid gap-4 text-sm text-gray-600 sm:grid-cols-2">

            <div>
              <p className="font-medium text-gray-800">
                Location
              </p>

              <p className="mt-1">
                {event.venue ||
                  event.location ||
                  "Not provided"}
              </p>

              {event.address && (
                <p className="mt-1 text-gray-500">
                  {event.address}
                </p>
              )}
            </div>

            <div>
              <p className="font-medium text-gray-800">
                Date & Time
              </p>

              <p className="mt-1">
                {event.date ||
                  "Date not set"}
              </p>

              {(event.startTime ||
                event.endTime) && (
                <p className="text-gray-500">
                  {event.startTime ||
                    ""}

                  {event.endTime
                    ? ` - ${event.endTime}`
                    : ""}
                </p>
              )}
            </div>

          </div>

          {/* =================================================
              REJECTION REASON
          ================================================= */}

          {event.status ===
            "rejected" &&
            event.rejectionReason && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Rejection reason
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {
                    event.rejectionReason
                  }
                </p>
              </div>
            )}

          {/* =================================================
              ADMIN UNPUBLISH MESSAGE
          ================================================= */}

          {event.status === "draft" &&
            event.rejectionReason ===
              "Event has been unpublished by admin." && (
              <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                  Event unpublished
                </p>

                <p className="mt-1 text-sm leading-6 text-orange-700">
                  This event was
                  unpublished by the
                  admin. Make the
                  required changes and
                  submit it again for
                  review.
                </p>
              </div>
            )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

            {/* VIEW */}

            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Eye size={17} />
              View
            </button>

            {/* EDIT */}

            {event.status ===
              "draft" && (
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <Pencil size={17} />
                Edit
              </button>
            )}

            {/* DELETE */}

            {event.status ===
              "draft" && (
              <button
                type="button"
                onClick={
                  handleDelete
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={17} />
                Delete
              </button>
            )}

          </div>
        </div>
      </div>
    </article>
  );
}