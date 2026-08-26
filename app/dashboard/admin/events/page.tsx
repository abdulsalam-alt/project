"use client";

import Link from "next/link";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  Search,
  XCircle,
} from "lucide-react";

import {
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  approveOrganizerEvent,
  getOrganizerEvents,
  rejectOrganizerEvent,
  subscribeToEventDrafts,
  type EventDraft,
} from "@/lib/dashboard/eventDraft";

const EMPTY_EVENTS: EventDraft[] = [];

function getServerEvents(): EventDraft[] {
  return EMPTY_EVENTS;
}

type Filter =
  | "all"
  | "pending-review"
  | "published"
  | "rejected"
  | "ended";

export default function AdminEventsPage() {
  const events = useSyncExternalStore(
    subscribeToEventDrafts,
    getOrganizerEvents,
    getServerEvents
  );

  const [filter, setFilter] =
    useState<Filter>("all");

  const [search, setSearch] =
    useState("");

  const filteredEvents = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesFilter =
        filter === "all"
          ? true
          : event.status === filter;

      const matchesSearch =
        !query ||
        event.title
          .toLowerCase()
          .includes(query) ||
        event.venue
          .toLowerCase()
          .includes(query) ||
        event.location
          .toLowerCase()
          .includes(query);

      return (
        matchesFilter &&
        matchesSearch
      );
    });
  }, [events, filter, search]);

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div>
          <p className="text-sm font-medium text-[#432616]">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#241507] sm:text-3xl">
            Events
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Review, approve and manage TEEKET
            events.
          </p>
        </div>

        {/* Search */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search events..."
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 outline-none transition focus:border-[#432616]"
            />
          </div>
        </div>

        {/* Filters */}

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All
          </FilterButton>

          <FilterButton
            active={
              filter === "pending-review"
            }
            onClick={() =>
              setFilter("pending-review")
            }
          >
            Pending
          </FilterButton>

          <FilterButton
            active={filter === "published"}
            onClick={() =>
              setFilter("published")
            }
          >
            Published
          </FilterButton>

          <FilterButton
            active={filter === "rejected"}
            onClick={() =>
              setFilter("rejected")
            }
          >
            Rejected
          </FilterButton>

          <FilterButton
            active={filter === "ended"}
            onClick={() =>
              setFilter("ended")
            }
          >
            Ended
          </FilterButton>
        </div>

        {/* Events */}

        <section className="mt-4">
          {filteredEvents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-5">
              {filteredEvents.map(
                (event) => (
                  <AdminEventCard
                    key={event.id}
                    event={event}
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function AdminEventCard({
  event,
}: {
  event: EventDraft;
}) {
  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const handleApprove = () => {
    setLoading(true);
    setMessage("");

    approveOrganizerEvent(event.id);

    setMessage(
      "Event approved and published."
    );

    setLoading(false);
  };

  const handleReject = () => {
    const reason = window.prompt(
      "Why are you rejecting this event?",
      "Please make the required changes."
    );

    if (reason === null) {
      return;
    }

    setLoading(true);
    setMessage("");

    rejectOrganizerEvent(
      event.id,
      reason.trim() ||
        "Please make the required changes."
    );

    setMessage("Event rejected.");

    setLoading(false);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Image */}

        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="h-56 w-full object-cover lg:h-full"
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-gray-100 text-sm text-gray-400 lg:h-full">
            No image
          </div>
        )}

        {/* Content */}

        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#241507]">
                {event.title ||
                  "Untitled event"}
              </h2>

              <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                {event.description ||
                  "No description provided."}
              </p>
            </div>

            <StatusBadge
              status={event.status}
            />
          </div>

          {/* Event information */}

          <div className="mt-6 grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
            <InfoItem
              icon={MapPin}
              label="Location"
            >
              {event.venue ||
                event.location ||
                "Not provided"}

              {event.address && (
                <>
                  <br />
                  {event.address}
                </>
              )}
            </InfoItem>

            <InfoItem
              icon={CalendarDays}
              label="Date & Time"
            >
              {event.date || "Not provided"}

              <br />

              {event.startTime || "--"} -{" "}
              {event.endTime || "--"}
            </InfoItem>
          </div>

          {/* Ticket summary */}

          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tickets
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {event.tickets.length ===
              0 ? (
                <p className="text-sm text-gray-500">
                  No tickets added.
                </p>
              ) : (
                event.tickets.map(
                  (ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-lg bg-white p-3"
                    >
                      <p className="font-medium text-[#241507]">
                        {ticket.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        ₦
                        {ticket.price.toLocaleString()}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {ticket.sold} sold /{" "}
                        {ticket.quantity} total
                      </p>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          {/* Actions */}

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={`/dashboard/admin/events/${encodeURIComponent(
                event.id
              )}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-[#432616] transition hover:bg-gray-50"
            >
              <Eye size={18} />
              View Full Event
            </Link>

            {event.status ===
              "pending-review" && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle size={18} />
                  Reject
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />

                  {loading
                    ? "Processing..."
                    : "Approve & Publish"}
                </button>
              </div>
            )}
          </div>

          {message && (
            <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm font-medium text-gray-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function InfoItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon
        size={18}
        className="mt-0.5 shrink-0 text-[#432616]"
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-1 leading-6">
          {children}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: EventDraft["status"];
}) {
  const config = {
    draft: {
      label: "Draft",
      className:
        "bg-gray-100 text-gray-600",
    },

    "pending-review": {
      label: "Pending Review",
      className:
        "bg-amber-50 text-amber-700",
    },

    published: {
      label: "Published",
      className:
        "bg-green-50 text-green-700",
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700",
    },

    ended: {
      label: "Ended",
      className:
        "bg-gray-100 text-gray-600",
    },
  };

  const current =
    config[status];

  return (
    <span
      className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-[#432616] text-white"
          : "bg-white text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
      <CalendarDays
        size={42}
        className="mx-auto text-gray-300"
      />

      <h2 className="mt-4 font-semibold text-[#241507]">
        No events found
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        There are no events matching your
        current filter.
      </p>
    </div>
  );
}