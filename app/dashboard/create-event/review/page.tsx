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

  const searchParams =
    useSearchParams();

  const draftId =
    searchParams.get("draftId");

  const draft = draftId
    ? getEventDraft(draftId)
    : null;

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const goBack = () => {
    if (!draft) {
      router.push(
        "/dashboard/create-event"
      );

      return;
    }

    if (
      draft.ticketType === "paid"
    ) {
      router.push(
        `/dashboard/create-event/payment?draftId=${encodeURIComponent(
          draft.id
        )}`
      );

      return;
    }

    router.push(
      `/dashboard/create-event/tickets/free?draftId=${encodeURIComponent(
        draft.id
      )}`
    );
  };

  const submitEvent = () => {
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

      if (
        !currentDraft.ticketType
      ) {
        throw new Error(
          "Please select a ticket type."
        );
      }

      if (
        currentDraft.tickets.length ===
        0
      ) {
        throw new Error(
          "Please add at least one ticket."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PAID EVENTS
      |--------------------------------------------------------------------------
      | Payment information is handled through
      | the organizer Account module.
      |
      | We do NOT publish here.
      */

      if (
        currentDraft.ticketType ===
          "paid"
      ) {
        const hasInvalidTicket =
          currentDraft.tickets.some(
            (ticket) =>
              ticket.price <= 0 ||
              ticket.quantity < 1
          );

        if (hasInvalidTicket) {
          throw new Error(
            "Please make sure all paid tickets have a valid price and quantity."
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | SUBMIT FOR ADMIN REVIEW
      |--------------------------------------------------------------------------
      */

      const submitted =
        submitEventForReview(
          draftId
        );

      if (!submitted) {
        throw new Error(
          "Unable to submit event."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | ADMIN DASHBOARD
      |--------------------------------------------------------------------------
      */

      router.push(
        "/dashboard/admin"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit event."
      );

      setSubmitting(false);
    }
  };

  if (!draft) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-red-600">
            Event draft could not be
            found.
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/create-event"
              )
            }
            className="mt-6 rounded-xl bg-[#432616] px-5 py-3 font-semibold text-white"
          >
            Back to Create Event
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="flex items-start gap-3">

          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616]"
          >
            <ArrowLeft
              size={20}
            />
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

        {/* EVENT */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">

          {draft.image && (
            <img
              src={draft.image}
              alt={draft.title}
              className="h-56 w-full object-cover sm:h-80"
            />
          )}

          <div className="p-5 sm:p-8">

            <h2 className="text-2xl font-semibold text-[#241507]">
              {draft.title}
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              {draft.description}
            </p>

            {/* LOCATION + TICKET */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-gray-50 p-4">

                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin
                    size={17}
                  />
                  Location
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  {draft.venue ||
                    draft.location}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {draft.address}
                </p>

              </div>

              <div className="rounded-xl bg-gray-50 p-4">

                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Ticket
                    size={17}
                  />
                  Ticket Type
                </div>

                <p className="mt-2 text-sm capitalize text-gray-600">
                  {draft.ticketType}
                </p>

              </div>

            </div>

            {/* TICKETS */}

            <div className="mt-7">

              <h3 className="font-semibold text-[#241507]">
                Tickets
              </h3>

              <div className="mt-3 space-y-3">

                {draft.tickets.map(
                  (ticket) => (
                    <div
                      key={ticket.id}
                      className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div>
                        <p className="font-medium">
                          {ticket.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {ticket.quantity}{" "}
                          available
                        </p>
                      </div>

                      <p className="font-semibold">
                        {ticket.price ===
                        0
                          ? "Free"
                          : `₦${ticket.price.toLocaleString()}`}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* NOTICE */}

            <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4">

              <p className="text-sm leading-6 text-amber-800">
                Your event will not be published
                immediately. After submission, it
                will be sent to the TEEKET admin team
                for review and approval.
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* BUTTONS */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={goBack}
                className="h-12 rounded-xl border border-gray-300 bg-white px-6 font-medium"
              >
                Back
              </button>

              <button
                type="button"
                onClick={
                  submitEvent
                }
                disabled={
                  submitting
                }
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white disabled:opacity-50"
              >
                <CheckCircle2
                  size={18}
                />

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