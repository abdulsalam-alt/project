"use client";

import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Ticket,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useState } from "react";

import {
  getEventDraft,
  submitEventForReview,
} from "@/lib/dashboard/eventDraft";

export default function ReviewEventPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const draftId = searchParams.get("draftId");

  const draft = draftId
    ? getEventDraft(draftId)
    : null;

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================================
     BACK TO TICKETS
  ========================================================= */

  const goBack = () => {
    if (!draft) {
      router.push(
        "/dashboard/create-event"
      );

      return;
    }

    router.push(
      `/dashboard/create-event/tickets?draftId=${encodeURIComponent(
        draft.id
      )}`
    );
  };

  /* =========================================================
     SUBMIT EVENT
  ========================================================= */

  const submitEvent = () => {
    if (submitting) {
      return;
    }

    if (!draftId) {
      setError(
        "Event draft could not be found."
      );

      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const currentDraft =
        getEventDraft(draftId);

      if (!currentDraft) {
        throw new Error(
          "Event draft could not be found."
        );
      }

      if (!currentDraft.ticketType) {
        throw new Error(
          "Please select a ticket type."
        );
      }

      if (
        !currentDraft.tickets ||
        currentDraft.tickets.length === 0
      ) {
        throw new Error(
          "Please add at least one ticket."
        );
      }

      /* =====================================================
         VALIDATE PAID TICKETS
      ===================================================== */

      if (
        currentDraft.ticketType === "paid" ||
        currentDraft.ticketType === "mixed"
      ) {
        const paidTickets =
          currentDraft.tickets.filter(
            (ticket) =>
              ticket.price > 0
          );

        if (
          paidTickets.length === 0
        ) {
          throw new Error(
            "Please add at least one paid ticket."
          );
        }

        const hasInvalidTicket =
          paidTickets.some(
            (ticket) =>
              ticket.price <= 0 ||
              ticket.quantity < 1 ||
              !ticket.name.trim()
          );

        if (hasInvalidTicket) {
          throw new Error(
            "Please make sure all paid tickets have a valid name, price and quantity."
          );
        }
      }

      /* =====================================================
         SUBMIT FOR ADMIN REVIEW
      ===================================================== */

      const submitted =
        submitEventForReview(
          draftId
        );

      if (!submitted) {
        throw new Error(
          "Unable to submit event for review."
        );
      }

      /*
       * IMPORTANT:
       *
       * Do NOT send the organizer to:
       *
       * /dashboard/admin
       *
       * The event has only been submitted
       * for review. The organizer should
       * remain in their normal dashboard.
       */

      router.push(
        `/dashboard/events?submitted=${encodeURIComponent(
          draftId
        )}`
      );
    } catch (err) {
      console.error(
        "TEEKET: Failed to submit event.",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit event for review."
      );

      setSubmitting(false);
    }
  };

  /* =========================================================
     NO DRAFT
  ========================================================= */

  if (!draft) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-red-700">
            Event draft could not be
            found.
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            The event draft may have been
            deleted or the link may be
            invalid.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/create-event"
              )
            }
            className="mt-6 rounded-xl bg-[#432616] px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Back to Create Event
          </button>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto max-w-4xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex items-start gap-3">

          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            aria-label="Go back to tickets"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-[#241507] sm:text-3xl">
              Review Event
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Check everything before
              submitting your event for
              approval.
            </p>
          </div>

        </div>

        {/* ===================================================
            EVENT CARD
        =================================================== */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">

          {/* EVENT IMAGE */}

          {draft.image && (
            <img
              src={draft.image}
              alt={draft.title}
              className="h-56 w-full object-cover sm:h-80"
            />
          )}

          <div className="p-5 sm:p-8">

            {/* TITLE */}

            <h2 className="text-2xl font-semibold text-[#241507]">
              {draft.title}
            </h2>

            {/* DESCRIPTION */}

            {draft.description && (
              <p className="mt-3 leading-7 text-gray-600">
                {draft.description}
              </p>
            )}

            {/* =================================================
                LOCATION + TICKET TYPE
            ================================================= */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              {/* LOCATION */}

              <div className="rounded-xl bg-gray-50 p-4">

                <div className="flex items-center gap-2 text-sm font-semibold text-[#241507]">
                  <MapPin size={17} />

                  Location
                </div>

                <p className="mt-2 text-sm text-gray-700">
                  {draft.venue ||
                    draft.location ||
                    "Location not specified"}
                </p>

                {draft.address && (
                  <p className="mt-1 text-sm text-gray-500">
                    {draft.address}
                  </p>
                )}

              </div>

              {/* TICKET TYPE */}

              <div className="rounded-xl bg-gray-50 p-4">

                <div className="flex items-center gap-2 text-sm font-semibold text-[#241507]">
                  <Ticket size={17} />

                  Ticket Type
                </div>

                <p className="mt-2 text-sm capitalize text-gray-700">
                  {draft.ticketType}
                </p>

              </div>

            </div>

            {/* =================================================
                TICKETS
            ================================================= */}

            <div className="mt-7">

              <h3 className="font-semibold text-[#241507]">
                Tickets
              </h3>

              <div className="mt-3 space-y-3">

                {draft.tickets.map(
                  (ticket) => (
                    <div
                      key={ticket.id}
                      className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="min-w-0">

                        <p className="font-medium text-[#241507]">
                          {ticket.name ||
                            "General Admission"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {ticket.quantity ===
                          -1
                            ? "Unlimited availability"
                            : `${ticket.quantity.toLocaleString()} available`}
                        </p>

                        {ticket.description && (
                          <p className="mt-1 text-xs text-gray-400">
                            {
                              ticket.description
                            }
                          </p>
                        )}

                      </div>

                      <p className="shrink-0 font-semibold text-[#241507]">
                        {ticket.price ===
                        0
                          ? "Free"
                          : `₦${Number(
                              ticket.price
                            ).toLocaleString()}`}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* =================================================
                ADMIN REVIEW NOTICE
            ================================================= */}

            <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4">

              <p className="text-sm leading-6 text-amber-800">
                Your event will not be
                published immediately. After
                submission, it will be sent to
                the TEEKET admin team for review
                and approval. You can track its
                status from your Events dashboard.
              </p>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <p className="text-sm font-medium leading-6 text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="h-12 rounded-xl border border-gray-300 bg-white px-6 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                onClick={submitEvent}
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={18} />

                {submitting
                  ? "Submitting..."
                  : "Submit for Approval"}
              </button>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}