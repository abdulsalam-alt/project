"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Ticket,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  getEventDraft,
  saveEventDraft,
  type EventTicket,
} from "@/lib/dashboard/eventDraft";

export default function FreeTicketsPage() {
  const router = useRouter();

  const [draftId] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return new URLSearchParams(
      window.location.search
    ).get("draftId");
  });

  const draft =
    draftId
      ? getEventDraft(draftId)
      : null;

  const [quantity, setQuantity] =
    useState(
      draft?.tickets[0]?.available
        ? String(
            draft.tickets[0].available
          )
        : ""
    );

  const [salesStart, setSalesStart] =
    useState(
      draft?.ticketSalesStart ?? ""
    );

  const [salesEnd, setSalesEnd] =
    useState(
      draft?.ticketSalesEnd ?? ""
    );

  const [errors, setErrors] = useState<{
    quantity?: string;
    salesStart?: string;
    salesEnd?: string;
  }>({});

  const goBack = () => {
    router.push(
      draftId
        ? `/dashboard/create-event/tickets?draftId=${encodeURIComponent(
            draftId
          )}`
        : "/dashboard/create-event/tickets"
    );
  };

  const handleContinue = () => {
    const next: typeof errors =
      {};

    const parsedQuantity =
      Number(quantity);

    if (
      !quantity ||
      !Number.isInteger(
        parsedQuantity
      ) ||
      parsedQuantity < 1
    ) {
      next.quantity =
        "Enter a ticket quantity greater than 0.";
    }

    if (!salesStart) {
      next.salesStart =
        "Select when ticket registration starts.";
    }

    if (!salesEnd) {
      next.salesEnd =
        "Select when ticket registration ends.";
    }

    if (
      salesStart &&
      salesEnd &&
      new Date(salesEnd) <=
        new Date(salesStart)
    ) {
      next.salesEnd =
        "Registration must end after it starts.";
    }

    setErrors(next);

    if (Object.keys(next).length) {
      return;
    }

    if (!draftId) {
      return;
    }

    saveEventDraft({
      id: draftId,

      ticketType: "free",

      tickets: [
      {
  id:
    draft?.tickets[0]?.id ??
    crypto.randomUUID(),

  name: "Free Ticket",

  price: 0,

  description: "Free admission",

  quantity: parsedQuantity,

  sold:
    draft?.tickets[0]?.sold ?? 0,
}
      ],

      ticketSalesStart:
        salesStart,

      ticketSalesEnd:
        salesEnd,

      payment: null,

      currentStep: "review",

      status: "draft",
    });

    router.push(
      `/dashboard/create-event/review?draftId=${encodeURIComponent(
        draftId
      )}`
    );
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto max-w-4xl">

        <div className="flex items-start gap-3">

          <button
            type="button"
            onClick={goBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white text-[#432616]"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-[#241507] sm:text-3xl">
              Free Event
            </h1>

            <p className="mt-2 text-gray-500">
              Set how many free tickets you
              want to make available.
            </p>
          </div>

        </div>

        <section className="mt-8 rounded-2xl border bg-white p-5 sm:p-8">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <Ticket size={24} />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Free ticket settings
          </h2>

          {/* QUANTITY */}

          <div className="mt-6">

            <label className="mb-2 block text-sm font-medium">
              Number of tickets
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              placeholder="100"
              className={`h-14 w-full rounded-xl border px-4 outline-none ${
                errors.quantity
                  ? "border-red-400"
                  : "border-gray-300 focus:border-[#432616]"
              }`}
            />

            {errors.quantity && (
              <p className="mt-2 text-sm text-red-600">
                {errors.quantity}
              </p>
            )}

          </div>

          {/* SALES PERIOD */}

          <div className="mt-8 border-t pt-8">

            <h3 className="font-semibold">
              Registration period
            </h3>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Registration starts
                </label>

                <div className="relative">

                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="datetime-local"
                    value={salesStart}
                    onChange={(e) =>
                      setSalesStart(
                        e.target.value
                      )
                    }
                    className={`h-14 w-full rounded-xl border pl-11 pr-4 outline-none ${
                      errors.salesStart
                        ? "border-red-400"
                        : "border-gray-300 focus:border-[#432616]"
                    }`}
                  />

                </div>

                {errors.salesStart && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.salesStart}
                  </p>
                )}

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Registration ends
                </label>

                <div className="relative">

                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="datetime-local"
                    value={salesEnd}
                    onChange={(e) =>
                      setSalesEnd(
                        e.target.value
                      )
                    }
                    className={`h-14 w-full rounded-xl border pl-11 pr-4 outline-none ${
                      errors.salesEnd
                        ? "border-red-400"
                        : "border-gray-300 focus:border-[#432616]"
                    }`}
                  />

                </div>

                {errors.salesEnd && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.salesEnd}
                  </p>
                )}

              </div>

            </div>

          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={goBack}
              className="h-12 rounded-xl border px-6 font-medium"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white"
            >
              Continue
              <ArrowRight size={18} />
            </button>

          </div>

        </section>
      </div>
    </main>
  );
}