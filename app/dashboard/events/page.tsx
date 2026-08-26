"use client";

import {
  CalendarDays,
  Clock,
  Eye,
  FileText,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { useRouter } from "next/navigation";

import type { Event } from "@/lib/data/event";

import {
  EMPTY_EVENTS,
  deleteOrganizerEvent,
  getOrganizerEvents,
  subscribeToEventDrafts,
} from "@/lib/dashboard/eventDraft";

/* =========================================================
   TYPES
========================================================= */

type EventTab =
  | "all"
  | "published"
  | "pending-review"
  | "draft"
  | "rejected"
  | "ended"
  | "cancelled";

/* =========================================================
   TABS
========================================================= */

const tabs: {
  id: EventTab;
  label: string;
}[] = [
  {
    id: "all",
    label: "All Events",
  },
  {
    id: "published",
    label: "Published",
  },
  {
    id: "pending-review",
    label: "Pending Review",
  },
  {
    id: "draft",
    label: "Drafts",
  },
  {
    id: "rejected",
    label: "Rejected",
  },
  {
    id: "ended",
    label: "Ended",
  },
  {
    id: "cancelled",
    label: "Cancelled",
  },
];

/* =========================================================
   SERVER SNAPSHOT
========================================================= */

/*
 * IMPORTANT:
 *
 * Do NOT return [] directly here.
 *
 * [] creates a new array every time React calls this
 * function, which causes:
 *
 * "The result of getServerSnapshot should be cached..."
 *
 * EMPTY_EVENTS is a stable constant exported from
 * eventDraft.ts.
 */

function getServerSnapshot(): Event[] {
  return EMPTY_EVENTS;
}

/* =========================================================
   STATUS LABEL
========================================================= */

function statusLabel(
  status: Event["status"]
): string {
  switch (status) {
    case "published":
      return "Published";

    case "pending-review":
      return "Pending Review";

    case "draft":
      return "Draft";

    case "rejected":
      return "Rejected";

    case "ended":
      return "Ended";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

/* =========================================================
   STATUS STYLE
========================================================= */

function statusClass(
  status: Event["status"]
): string {
  switch (status) {
    case "published":
      return "bg-green-50 text-green-700";

    case "pending-review":
      return "bg-amber-50 text-amber-700";

    case "rejected":
      return "bg-red-50 text-red-700";

    case "ended":
      return "bg-gray-100 text-gray-600";

    case "cancelled":
      return "bg-gray-100 text-gray-600";

    case "draft":
    default:
      return "bg-gray-100 text-gray-600";
  }
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
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function OrganizerEventsPage() {
  const router = useRouter();

  /* =======================================================
     STATE
  ======================================================= */

  const [
    activeTab,
    setActiveTab,
  ] = useState<EventTab>("all");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    deleteId,
    setDeleteId,
  ] = useState<string | null>(null);

  /* =======================================================
     EVENTS
  ======================================================= */

  const events = useSyncExternalStore(
    subscribeToEventDrafts,
    getOrganizerEvents,
    getServerSnapshot
  );

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredEvents = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return events.filter((event) => {
      const matchesTab =
        activeTab === "all" ||
        event.status === activeTab;

      if (!matchesTab) {
        return false;
      }

      if (!query) {
        return true;
      }

      const text = [
        event.title,
        event.description,
        event.category,
        event.location,
        event.venue,
        event.slug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [
    events,
    activeTab,
    search,
  ]);

  /* =======================================================
     COUNT
  ======================================================= */

  const getCount = (
    tab: EventTab
  ) => {
    return events.filter(
      (event) =>
        event.status === tab
    ).length;
  };

  /* =======================================================
     TICKET TOTAL
  ======================================================= */

  const totalTickets = (
    event: Event
  ) => {
    return event.tickets.reduce(
      (total, ticket) => {
        if (ticket.quantity < 0) {
          return total;
        }

        return (
          total +
          ticket.quantity
        );
      },
      0
    );
  };

  /* =======================================================
     SOLD
  ======================================================= */

  const soldTickets = (
    event: Event
  ) => {
    return event.tickets.reduce(
      (total, ticket) =>
        total +
        (ticket.sold ?? 0),
      0
    );
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = (
    id: string
  ) => {
    if (!id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this event?"
      );

    if (!confirmed) {
      return;
    }

    deleteOrganizerEvent(id);

    setDeleteId(null);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#432616]">
              Organizer
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#241507] sm:text-4xl">
              My Events
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage and track all your events.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/create-event"
              )
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-6 font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={19} />
            Create Event
          </button>
        </div>

        {/* TABS */}

        <div className="overflow-x-auto border-b border-gray-200">
          <div className="flex min-w-max gap-7">
            {tabs.map((tab) => {
              const active =
                activeTab === tab.id;

              const count =
                tab.id === "all"
                  ? events.length
                  : getCount(tab.id);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                  className={`relative flex items-center gap-2 pb-4 text-sm font-medium ${
                    active
                      ? "text-[#432616]"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active
                        ? "bg-[#432616] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>

                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#432616]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH */}

        {events.length > 0 && (
          <div className="mt-6">
            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search your events..."
              className="h-12 w-full max-w-xl rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
            />
          </div>
        )}

        {/* CONTENT */}

        <div className="mt-6">
          {filteredEvents.length === 0 ? (
            <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#432616]/10 text-[#432616]">
                <FileText size={28} />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[#241507]">
                {search
                  ? "No matching events"
                  : activeTab === "all"
                  ? "No events yet"
                  : `No ${statusLabel(
                      activeTab
                    ).toLowerCase()} events`}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                {search
                  ? "Try a different search term."
                  : "Create an event to start managing your events."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard/create-event"
                    )
                  }
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#432616] px-5 font-semibold text-white"
                >
                  <Plus size={18} />
                  Create Event
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredEvents.map(
                (event) => {
                  const total =
                    totalTickets(
                      event
                    );

                  const sold =
                    soldTickets(
                      event
                    );

                  const remaining =
                    Math.max(
                      0,
                      total - sold
                    );

                  return (
                    <div
                      key={event.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                    >
                      <div className="flex flex-col md:flex-row">

                        {/* IMAGE */}

                        <div className="h-56 w-full shrink-0 bg-gray-100 md:min-h-[300px] md:h-auto md:w-72">
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={
                                event.title ||
                                "Event"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full min-h-56 items-center justify-center text-gray-400">
                              <CalendarDays
                                size={42}
                              />
                            </div>
                          )}
                        </div>

                        {/* CONTENT */}

                        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">

                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h2 className="truncate text-xl font-semibold text-[#241507]">
                                {event.title ||
                                  "Untitled Event"}
                              </h2>

                              <p className="mt-1 text-sm text-gray-500">
                                {event.category ||
                                  "Category not set"}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                                event.status
                              )}`}
                            >
                              {statusLabel(
                                event.status
                              )}
                            </span>
                          </div>

                          <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
                            {event.description ||
                              "No description added yet."}
                          </p>

                          {/* EVENT INFORMATION */}

                          <div className="mt-5 grid gap-4 text-sm text-gray-600 sm:grid-cols-3">

                            <div className="flex min-w-0 items-center gap-2">
                              <CalendarDays
                                size={17}
                                className="shrink-0 text-[#432616]"
                              />

                              <span className="truncate">
                                {formatDate(
                                  event.date
                                )}
                              </span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2">
                              <Clock
                                size={17}
                                className="shrink-0 text-[#432616]"
                              />

                              <span className="truncate">
                                {event.time ||
                                  "Time not set"}
                              </span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2">
                              <MapPin
                                size={17}
                                className="shrink-0 text-[#432616]"
                              />

                              <span className="truncate">
                                {event.venue ||
                                  event.location ||
                                  "Location not set"}
                              </span>
                            </div>

                          </div>

                          {/* TICKETS */}

                          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">

                            <div>
                              <p className="text-xs text-gray-400">
                                Total tickets
                              </p>

                              <p className="mt-1 text-lg font-semibold text-[#241507]">
                                {total}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Sold
                              </p>

                              <p className="mt-1 text-lg font-semibold text-[#241507]">
                                {sold}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-400">
                                Remaining
                              </p>

                              <p className="mt-1 text-lg font-semibold text-[#241507]">
                                {remaining}
                              </p>
                            </div>

                          </div>

                          {/* ACTIONS */}

                          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/dashboard/events/${encodeURIComponent(
                                    event.slug
                                  )}`
                                )
                              }
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              <Eye size={17} />
                              View Event
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteId(
                                  event.id
                                )
                              }
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={17} />
                              Delete
                            </button>

                          </div>

                          {/* DELETE */}

                          {deleteId ===
                            event.id && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                              <p className="text-sm font-medium text-red-700">
                                Are you sure you want to delete this event?
                              </p>

                              <div className="mt-3 flex gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      event.id
                                    )
                                  }
                                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                                >
                                  Delete
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteId(
                                      null
                                    )
                                  }
                                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}