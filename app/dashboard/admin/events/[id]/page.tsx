"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Ticket,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  approveOrganizerEvent,
  getEventDraft,
  rejectOrganizerEvent,
  subscribeToEventDrafts,
  type EventDraft,
} from "@/lib/dashboard/eventDraft";

export default function AdminEventPreviewPage() {
  const params = useParams();
  const router = useRouter();

  const eventId =
    typeof params.id === "string"
      ? params.id
      : "";

  /*
   * Event is loaded synchronously because
   * getEventDraft() reads from the cached
   * localStorage data.
   */
  const [event, setEvent] =
    useState<EventDraft | null>(() => {
      if (!eventId) {
        return null;
      }

      return getEventDraft(eventId);
    });

  const [actionLoading, setActionLoading] =
    useState(false);

  /*
   * Subscribe only to external event-draft
   * changes.
   *
   * We do NOT call setState synchronously
   * inside the effect body.
   */
  useEffect(() => {
    if (!eventId) {
      return;
    }

    const handleEventDraftChange = () => {
      setEvent(
        getEventDraft(eventId)
      );
    };

    return subscribeToEventDrafts(
      handleEventDraftChange
    );
  }, [eventId]);

  const handleApprove = () => {
    if (!eventId || actionLoading) {
      return;
    }

    setActionLoading(true);

    try {
      const approved =
        approveOrganizerEvent(
          eventId
        );

      if (approved) {
        router.push(
          "/dashboard/admin/event"
        );
      }
    } catch (error) {
      console.error(
        "Failed to approve event:",
        error
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    if (!eventId || actionLoading) {
      return;
    }

    setActionLoading(true);

    try {
      const rejected =
        rejectOrganizerEvent(
          eventId
        );

      if (rejected) {
        router.push(
          "/dashboard/admin/event"
        );
      }
    } catch (error) {
      console.error(
        "Failed to reject event:",
        error
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * No event ID.
   */
  if (!eventId) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <XCircle className="h-7 w-7 text-gray-500" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-gray-900">
              Event not found
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              No event ID was provided.
            </p>

            <Link
              href="/dashboard/admin/event"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Event doesn't exist.
   */
  if (!event) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <XCircle className="h-7 w-7 text-gray-500" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-gray-900">
              Event not found
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              This event may have been
              deleted or is no longer
              available.
            </p>

            <Link
              href="/dashboard/admin/event"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const image =
    event.image ||
    "/images/events/default-event.jpg";

  const eventTime =
    event.startTime ||
    event.time ||
    "Time not set";

  const eventLocation =
    event.location ||
    "Location not set";

  const eventVenue =
    event.venue ||
    "";

  const eventAddress =
    event.address ||
    "";

  const isPending =
    event.status ===
    "pending-review";

  const isPublished =
    event.status ===
    "published";

  const isRejected =
    event.status ===
    "rejected";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/admin/event"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isPending
                  ? "bg-yellow-100 text-yellow-700"
                  : isPublished
                  ? "bg-green-100 text-green-700"
                  : isRejected
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {event.status ===
              "pending-review"
                ? "Pending Review"
                : event.status
                    .charAt(0)
                    .toUpperCase() +
                  event.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ===================================================
            EVENT IMAGE
        =================================================== */}

        <div className="overflow-hidden rounded-2xl bg-gray-100">
          <div className="relative aspect-[16/7] w-full">
            <img
              src={image}
              alt={event.title}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              {event.category && (
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur">
                  {event.category}
                </span>
              )}

              <h1 className="mt-3 max-w-4xl text-2xl font-bold text-white sm:text-4xl lg:text-5xl">
                {event.title ||
                  "Untitled Event"}
              </h1>
            </div>
          </div>
        </div>

        {/* ===================================================
            EVENT INFORMATION
        =================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* =================================================
              MAIN
          ================================================= */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
            <h2 className="text-xl font-semibold text-gray-900">
              Event details
            </h2>

            {/* META */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <CalendarDays className="h-5 w-5 text-gray-700" />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {event.date ||
                      "Date not set"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <Clock3 className="h-5 w-5 text-gray-700" />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Time
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {eventTime}

                    {event.endTime
                      ? ` - ${event.endTime}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:col-span-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <MapPin className="h-5 w-5 text-gray-700" />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {eventLocation}
                  </p>

                  {eventVenue && (
                    <p className="mt-1 text-sm text-gray-500">
                      {eventVenue}
                    </p>
                  )}

                  {eventAddress && (
                    <p className="mt-1 text-sm text-gray-500">
                      {eventAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="mt-8 border-t border-gray-100 pt-7">
              <h3 className="text-base font-semibold text-gray-900">
                About this event
              </h3>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                {event.description ||
                  "No event description was provided."}
              </p>
            </div>

            {/* TICKETS */}

            <div className="mt-8 border-t border-gray-100 pt-7">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-gray-700" />

                <h3 className="text-base font-semibold text-gray-900">
                  Tickets
                </h3>
              </div>

              {event.tickets.length ===
              0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    No tickets have been
                    configured for this
                    event.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {event.tickets.map(
                    (ticket) => (
                      <div
                        key={ticket.id}
                        className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {ticket.name}
                          </p>

                          {ticket.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {
                                ticket.description
                              }
                            </p>
                          )}

                          <p className="mt-2 text-xs text-gray-500">
                            Quantity:{" "}
                            {ticket.quantity ===
                            -1
                              ? "Unlimited"
                              : ticket.quantity}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-gray-900">
                            {ticket.price ===
                            0
                              ? "Free"
                              : `₦${ticket.price.toLocaleString()}`}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {ticket.available ===
                            -1
                              ? "Unlimited available"
                              : `${ticket.available} available`}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="space-y-5">
            {/* ORGANIZER */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">
                Organizer
              </h2>

              <div className="mt-4 flex items-center gap-3">
                {event.organizer?.image ? (
                  <img
                    src={
                      event.organizer
                        .image
                    }
                    alt={
                      event.organizer
                        .name ||
                      "Organizer"
                    }
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                )}

                <div>
                  <p className="font-medium text-gray-900">
                    {event.organizer?.name ||
                      "TEEKET Organizer"}
                  </p>

                  <p className="text-xs text-gray-500">
                    Event organizer
                  </p>
                </div>
              </div>
            </div>

            {/* REVIEW ACTIONS */}

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">
                Review event
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Review the event details
                before deciding whether it
                should be published.
              </p>

              {isPending ? (
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={
                      handleApprove
                    }
                    disabled={
                      actionLoading
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />

                    {actionLoading
                      ? "Processing..."
                      : "Approve event"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleReject
                    }
                    disabled={
                      actionLoading
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />

                    Reject event
                  </button>
                </div>
              ) : (
                <div
                  className={`mt-5 rounded-xl p-4 ${
                    isPublished
                      ? "bg-green-50"
                      : isRejected
                      ? "bg-red-50"
                      : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      isPublished
                        ? "text-green-700"
                        : isRejected
                        ? "text-red-700"
                        : "text-gray-700"
                    }`}
                  >
                    {isPublished
                      ? "This event has been approved and published."
                      : isRejected
                      ? "This event has been rejected."
                      : `Current status: ${event.status}`}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}