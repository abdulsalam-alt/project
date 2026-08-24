"use client";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Ticket,
  XCircle,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

import {
  approveOrganizerEvent,
  getEventDraft,
  getOrganizerEvents,
  rejectOrganizerEvent,
  subscribeToEventDrafts,
  type EventDraft,
} from "@/lib/dashboard/eventDraft";

const EMPTY_EVENTS: EventDraft[] = [];

function getServerEvents(): EventDraft[] {
  return EMPTY_EVENTS;
}

export default function AdminEventDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const events = useSyncExternalStore(
    subscribeToEventDrafts,
    getOrganizerEvents,
    getServerEvents
  );

  const eventId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const event = events.find(
    (item) => item.id === eventId
  );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const handleApprove = () => {
    if (!event) {
      return;
    }

    setLoading(true);
    setMessage("");

    approveOrganizerEvent(event.id);

    setMessage(
      "Event approved and published successfully."
    );

    setLoading(false);
  };

  const handleReject = () => {
    if (!event) {
      return;
    }

    const reason = window.prompt(
      "Reason for rejecting this event:",
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

    setMessage(
      "Event rejected successfully."
    );

    setLoading(false);
  };

  if (!event) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard/admin/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#432616]"
          >
            <ArrowLeft size={18} />
            Back to Events
          </Link>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-[#241507]">
              Event not found
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              This event may have been removed.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back */}

        <Link
          href="/dashboard/admin/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#432616]"
        >
          <ArrowLeft size={18} />
          Back to Events
        </Link>

        {/* Header */}

        <div className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#432616]">
                Event Review
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#241507] sm:text-3xl">
                {event.title}
              </h1>
            </div>

            <StatusBadge
              status={event.status}
            />
          </div>
        </div>

        {/* Event */}

        <article className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {/* Hero */}

          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="h-56 w-full object-cover sm:h-96"
            />
          ) : (
            <div className="flex h-56 items-center justify-center bg-gray-100 text-gray-400 sm:h-96">
              No event image
            </div>
          )}

          <div className="p-5 sm:p-8">
            {/* Description */}

            <section>
              <h2 className="text-lg font-bold text-[#241507]">
                About this event
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                {event.description ||
                  "No description provided."}
              </p>
            </section>

            {/* Event information */}

            <section className="mt-8">
              <h2 className="text-lg font-bold text-[#241507]">
                Event information
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailCard
                  icon={CalendarDays}
                  title="Date"
                  value={
                    event.date ||
                    "Not provided"
                  }
                />

                <DetailCard
                  icon={Clock3}
                  title="Time"
                  value={`${event.startTime || "--"} - ${
                    event.endTime || "--"
                  }`}
                />

                <DetailCard
                  icon={MapPin}
                  title="Venue"
                  value={
                    event.venue ||
                    "Not provided"
                  }
                />

                <DetailCard
                  icon={MapPin}
                  title="Location"
                  value={
                    event.location ||
                    "Not provided"
                  }
                />
              </div>

              {event.address && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Address
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {event.address}
                  </p>
                </div>
              )}
            </section>

            {/* Category */}

            <section className="mt-8">
              <h2 className="text-lg font-bold text-[#241507]">
                Category
              </h2>

              <div className="mt-3 inline-flex rounded-full bg-[#432616]/10 px-4 py-2 text-sm font-medium capitalize text-[#432616]">
                {event.category
                  ? event.category.replace(
                      /-/g,
                      " "
                    )
                  : "Not specified"}
              </div>
            </section>

            {/* Tickets */}

            <section className="mt-8">
              <div className="flex items-center gap-2">
                <Ticket
                  size={20}
                  className="text-[#432616]"
                />

                <h2 className="text-lg font-bold text-[#241507]">
                  Ticket types
                </h2>
              </div>

              {event.tickets.length ===
              0 ? (
                <div className="mt-4 rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
                  No ticket types have been
                  configured.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {event.tickets.map(
                    (ticket) => {
                      const remaining =
                        Math.max(
                          ticket.quantity -
                            ticket.sold,
                          0
                        );

                      return (
                        <div
                          key={ticket.id}
                          className="rounded-xl border border-gray-200 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="font-semibold text-[#241507]">
                                {ticket.name}
                              </h3>

                              <p className="mt-1 text-sm text-gray-500">
                                {ticket.price ===
                                0
                                  ? "Free"
                                  : `₦${ticket.price.toLocaleString()}`}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:text-right">
                              <div>
                                <p className="text-xs text-gray-400">
                                  Total
                                </p>

                                <p className="font-semibold">
                                  {ticket.quantity.toLocaleString()}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-400">
                                  Sold
                                </p>

                                <p className="font-semibold">
                                  {ticket.sold.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-gray-100 pt-3">
                            <p className="text-xs text-gray-500">
                              Remaining:{" "}
                              <span className="font-semibold text-gray-700">
                                {remaining.toLocaleString()}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            {/* Admin action */}

            {event.status ===
              "pending-review" && (
              <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                <h2 className="font-bold text-amber-900">
                  Ready for review
                </h2>

                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Review all event information
                  above before deciding whether
                  this event should be published.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={loading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={19} />
                    Reject Event
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={loading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 size={19} />

                    {loading
                      ? "Processing..."
                      : "Approve & Publish"}
                  </button>
                </div>
              </section>
            )}

            {/* Rejection */}

            {event.status ===
                "rejected" &&
              event.rejectionReason && (
                <section className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
                  <h2 className="font-bold text-red-800">
                    Rejection reason
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-red-700">
                    {event.rejectionReason}
                  </p>
                </section>
              )}

            {message && (
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">
                  {message}
                </p>
              </div>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}

function DetailCard({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof CalendarDays;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <Icon size={16} />
        {title}
      </div>

      <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: EventDraft["status"];
}) {
  const config = {
    draft: "bg-gray-100 text-gray-600",
    "pending-review":
      "bg-amber-50 text-amber-700",
    published:
      "bg-green-50 text-green-700",
    rejected:
      "bg-red-50 text-red-700",
    ended:
      "bg-gray-100 text-gray-600",
  };

  const labels = {
    draft: "Draft",
    "pending-review": "Pending Review",
    published: "Published",
    rejected: "Rejected",
    ended: "Ended",
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${config[status]}`}
    >
      {labels[status]}
    </span>
  );
}