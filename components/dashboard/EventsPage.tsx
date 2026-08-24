"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  MapPin,
  Plus,
  RotateCcw,
  Ticket,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  deleteOrganizerEvent,
  getOrganizerEvents,
  type EventDraft,
  type EventStatus,
} from "@/lib/dashboard/event";

/*
|--------------------------------------------------------------------------
| TABS
|--------------------------------------------------------------------------
*/

type EventTab =
  | "all"
  | "published"
  | "pending-review"
  | "draft"
  | "ended";

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
    id: "ended",
    label: "Ended",
  },
];

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function EventPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<EventTab>("all");

  const [organizerEvents, setOrganizerEvents] =
    useState<EventDraft[]>(() =>
      getOrganizerEvents()
    );

  const [search, setSearch] =
    useState("");

  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD EVENTS
  |--------------------------------------------------------------------------
  */

  const refreshEvents = () => {
    setOrganizerEvents(
      getOrganizerEvents()
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LISTEN FOR UPDATES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleUpdate = () => {
      refreshEvents();
    };

    window.addEventListener(
      "teeket-organizer-events-updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "teeket-organizer-events-updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTER EVENTS
  |--------------------------------------------------------------------------
  */

  const filteredEvents = useMemo(() => {
    let result = organizerEvents;

    /*
     * STATUS FILTER
     */

    if (activeTab !== "all") {
      result = result.filter(
        (event) =>
          event.status === activeTab
      );
    }

    /*
     * SEARCH
     */

    const query =
      search.trim().toLowerCase();

    if (query) {
      result = result.filter((event) => {
        return (
          event.title
            .toLowerCase()
            .includes(query) ||
          event.description
            .toLowerCase()
            .includes(query) ||
          event.location
            .toLowerCase()
            .includes(query) ||
          event.category
            .toLowerCase()
            .includes(query)
        );
      });
    }

    return result;
  }, [
    organizerEvents,
    activeTab,
    search,
  ]);

  /*
  |--------------------------------------------------------------------------
  | COUNTS
  |--------------------------------------------------------------------------
  */

  const getCount = (
    status?: EventStatus
  ) => {
    if (!status) {
      return organizerEvents.length;
    }

    return organizerEvents.filter(
      (event) =>
        event.status === status
    ).length;
  };

  /*
  |--------------------------------------------------------------------------
  | TICKET HELPERS
  |--------------------------------------------------------------------------
  */

  const getTotalTickets = (
    event: EventDraft
  ) => {
    return event.tickets.reduce(
      (total, ticket) =>
        total + Number(ticket.available || 0),
      0
    );
  };

  const getSoldTickets = (
    event: EventDraft
  ) => {
    return event.tickets.reduce(
      (total, ticket) =>
        total + Number(ticket.sold || 0),
      0
    );
  };

  const getRemainingTickets = (
    event: EventDraft
  ) => {
    return Math.max(
      0,
      getTotalTickets(event) -
        getSoldTickets(event)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS BADGE
  |--------------------------------------------------------------------------
  */

  const statusBadge = (
    status: EventStatus
  ) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 size={13} />
            Published
          </span>
        );

      case "pending-review":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
            <AlertCircle size={13} />
            Pending Review
          </span>
        );

      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            <FileText size={13} />
            Draft
          </span>
        );

      case "ended":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
            <Clock size={13} />
            Ended
          </span>
        );

      default:
        return null;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | EMPTY STATE
  |--------------------------------------------------------------------------
  */

  const getEmptyState = () => {
    switch (activeTab) {
      case "published":
        return {
          title: "No published events",
          description:
            "Events approved by the admin will appear here.",
        };

      case "pending-review":
        return {
          title:
            "No events pending review",
          description:
            "Events waiting for admin approval will appear here.",
        };

      case "draft":
        return {
          title: "No drafts",
          description:
            "Events you save as drafts will appear here.",
        };

      case "ended":
        return {
          title: "No ended events",
          description:
            "Events that have ended will appear here.",
        };

      default:
        return {
          title:
            "No events created yet",
          description:
            "Create your first event to start selling tickets.",
        };
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CONTINUE DRAFT
  |--------------------------------------------------------------------------
  */

  const continueDraft = (
    event: EventDraft
  ) => {
    if (!event.id) {
      return;
    }

    /*
     * Continue from the correct step.
     */

    switch (event.currentStep) {
      case "location":
        router.push(
          `/dashboard/create-event/location?draftId=${encodeURIComponent(
            event.id
          )}`
        );
        break;

      case "tickets":
        router.push(
          `/dashboard/create-event/tickets?draftId=${encodeURIComponent(
            event.id
          )}`
        );
        break;

      case "details":
      default:
        router.push(
          `/dashboard/create-event?draftId=${encodeURIComponent(
            event.id
          )}`
        );
        break;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE EVENT
  |--------------------------------------------------------------------------
  */

  const createEvent = () => {
    router.push(
      "/dashboard/create-event"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = (
    id: string
  ) => {
    const deleted =
      deleteOrganizerEvent(id);

    if (deleted) {
      refreshEvents();
    }

    setDeleteId(null);
  };

  /*
  |--------------------------------------------------------------------------
  | EMPTY
  |--------------------------------------------------------------------------
  */

  const empty = getEmptyState();

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-medium text-[#432616]">
              Organizer
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#241507] sm:text-4xl">
              Events
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage your events.
            </p>
          </div>

          <button
            type="button"
            onClick={createEvent}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-6 font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={19} />
            Create Event
          </button>
        </div>

        {/* TABS */}

        <div className="mb-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => {
              const count =
                tab.id === "all"
                  ? getCount()
                  : getCount(tab.id);

              const active =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                    active
                      ? "bg-[#432616] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH */}

        {organizerEvents.length > 0 && (
          <div className="mb-6">
            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search your events..."
              className="h-12 w-full max-w-xl rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-[#432616] focus:ring-1 focus:ring-[#432616]"
            />
          </div>
        )}

        {/* LOADING */}

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#432616]/10 text-[#432616]">
              <FileText size={28} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#241507]">
              {search
                ? "No matching events"
                : empty.title}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {search
                ? "Try a different search term."
                : empty.description}
            </p>

            {activeTab === "all" &&
              organizerEvents.length === 0 && (
                <button
                  type="button"
                  onClick={createEvent}
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
                /*
                 * IMPORTANT:
                 * Use event.id as the key because
                 * organizer-created drafts always
                 * receive an id.
                 */

                return (
                  <div
                    key={event.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                  >

                    <div className="flex flex-col md:flex-row">

                      {/* IMAGE */}

                      <div className="h-56 w-full shrink-0 bg-gray-100 md:h-auto md:w-72">

                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.title}
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

                        {/* TITLE */}

                        <div className="flex flex-wrap items-center gap-3">

                          <h2 className="text-xl font-semibold text-[#241507]">
                            {event.title ||
                              "Untitled Event"}
                          </h2>

                          {statusBadge(
                            event.status
                          )}
                        </div>

                        {/* DESCRIPTION */}

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                          {event.description ||
                            "No description added yet."}
                        </p>

                        {/* DETAILS */}

                        <div className="mt-5 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">

                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={17}
                              className="text-[#432616]"
                            />

                            <span>
                              {event.date ||
                                "Date not set"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock
                              size={17}
                              className="text-[#432616]"
                            />

                            <span>
                              {event.startTime ||
                                "Time not set"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin
                              size={17}
                              className="text-[#432616]"
                            />

                            <span className="truncate">
                              {event.location ||
                                "Location not set"}
                            </span>
                          </div>
                        </div>

                        {/* TICKETS */}

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">

                          <div className="rounded-xl bg-gray-50 p-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Ticket size={15} />
                              Tickets
                            </div>

                            <p className="mt-1 text-lg font-semibold text-[#241507]">
                              {getTotalTickets(
                                event
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">
                              Sold
                            </p>

                            <p className="mt-1 text-lg font-semibold text-[#241507]">
                              {getSoldTickets(
                                event
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">
                              Remaining
                            </p>

                            <p className="mt-1 text-lg font-semibold text-[#241507]">
                              {getRemainingTickets(
                                event
                              )}
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                          {event.status ===
                            "draft" ? (
                            <button
                              type="button"
                              onClick={() =>
                                continueDraft(
                                  event
                                )
                              }
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#432616] px-5 font-medium text-white hover:opacity-90"
                            >
                              <RotateCcw
                                size={17}
                              />
                              Continue
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <Eye size={17} />
                              View
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteId(
                                event.id
                              )
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2
                              size={17}
                            />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-xl font-semibold text-[#241507]">
              Delete event?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This event will be removed from
              your organizer dashboard. This
              action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setDeleteId(null)
                }
                className="h-11 rounded-xl border border-gray-200 px-5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDelete(deleteId)
                }
                className="h-11 rounded-xl bg-red-600 px-5 font-semibold text-white hover:bg-red-700"
              >
                Delete Event
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}