"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Plus,
  Ticket,
  Trash2,
} from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  getEventDraft,
  saveEventDraft,
  type EventTicket,
} from "@/lib/dashboard/eventDraft";

function createNewTicket(): EventTicket {
  return {
    id: crypto.randomUUID(),
    name: "",
    price: 0,
    quantity: 0,
    sold: 0,
    description: "",
  };
}

export default function PaidTicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const draftId = searchParams.get("draftId");

  const draft = useMemo(() => {
    if (!draftId) {
      return null;
    }

    return getEventDraft(draftId);
  }, [draftId]);

  const [tickets, setTickets] = useState<EventTicket[]>(() => {
    if (draft?.tickets && draft.tickets.length > 0) {
      return draft.tickets;
    }

    return [createNewTicket()];
  });

  const [salesStart, setSalesStart] = useState(
    draft?.ticketSalesStart ?? ""
  );

  const [salesEnd, setSalesEnd] = useState(
    draft?.ticketSalesEnd ?? ""
  );

  const [error, setError] = useState("");

  const ticketPageUrl = draftId
    ? `/dashboard/create-event/tickets?draftId=${encodeURIComponent(
        draftId
      )}`
    : "/dashboard/create-event/tickets";

  const paymentPageUrl = draftId
    ? `/dashboard/create-event/payment?draftId=${encodeURIComponent(
        draftId
      )}`
    : "/dashboard/create-event/payment";

  const goBack = () => {
    router.push(ticketPageUrl);
  };

  const updateTicket = (
    id: string,
    field: keyof EventTicket,
    value: string | number
  ) => {
    setTickets((current) =>
      current.map((ticket) => {
        if (ticket.id !== id) {
          return ticket;
        }

        return {
          ...ticket,
          [field]: value,
        };
      })
    );

    setError("");
  };

  const addTicket = () => {
    setTickets((current) => [
      ...current,
      createNewTicket(),
    ]);

    setError("");
  };

  const removeTicket = (id: string) => {
    if (tickets.length <= 1) {
      setError("You must have at least one ticket type.");
      return;
    }

    setTickets((current) =>
      current.filter((ticket) => ticket.id !== id)
    );

    setError("");
  };

  const handleContinue = () => {
    setError("");

    if (!draftId) {
      setError(
        "Event draft could not be found. Please start the event again."
      );
      return;
    }

    const currentDraft = getEventDraft(draftId);

    if (!currentDraft) {
      setError(
        "Event draft could not be found. Please start the event again."
      );
      return;
    }

    if (tickets.length === 0) {
      setError("Add at least one ticket type.");
      return;
    }

    for (const ticket of tickets) {
      if (!ticket.name.trim()) {
        setError("Every ticket must have a name.");
        return;
      }

      if (
        !Number.isFinite(ticket.price) ||
        ticket.price <= 0
      ) {
        setError(
          "Every paid ticket must have a price greater than ₦0."
        );
        return;
      }

      if (
        !Number.isInteger(ticket.quantity) ||
        ticket.quantity < 1
      ) {
        setError(
          "Every ticket must have at least 1 available ticket."
        );
        return;
      }
    }

    if (!salesStart) {
      setError("Select when ticket sales start.");
      return;
    }

    if (!salesEnd) {
      setError("Select when ticket sales end.");
      return;
    }

    const startDate = new Date(salesStart);
    const endDate = new Date(salesEnd);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      setError("Please enter valid sales dates.");
      return;
    }

    if (endDate <= startDate) {
      setError(
        "Ticket sales must end after they start."
      );
      return;
    }

    saveEventDraft({
      ...currentDraft,

      tickets,

      ticketType: "paid",

      ticketSalesStart: salesStart,

      ticketSalesEnd: salesEnd,

      currentStep: "payment",

      status: "draft",
    });

    router.push(paymentPageUrl);
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* HEADER */}

        <div className="flex items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616] transition hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-[#241507] sm:text-3xl">
              Paid Tickets
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
              Create your ticket types and set when ticket
              sales will open and close.
            </p>
          </div>
        </div>

        {/* MAIN */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#432616]/10 text-[#432616]">
            <Ticket size={24} />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-[#241507]">
            Ticket types
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Add the different types of tickets attendees can
            purchase.
          </p>

          {/* TICKETS */}

          <div className="mt-6 space-y-5">
            {tickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-4 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#241507]">
                    Ticket {index + 1}
                  </h3>

                  {tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeTicket(ticket.id)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                      aria-label={`Remove ticket ${
                        index + 1
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">

                  {/* NAME */}

                  <div>
                    <label
                      htmlFor={`ticket-name-${ticket.id}`}
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Ticket name
                    </label>

                    <input
                      id={`ticket-name-${ticket.id}`}
                      type="text"
                      value={ticket.name}
                      onChange={(event) =>
                        updateTicket(
                          ticket.id,
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="Regular"
                      className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#432616]"
                    />
                  </div>

                  {/* PRICE */}

                  <div>
                    <label
                      htmlFor={`ticket-price-${ticket.id}`}
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Price
                    </label>

                    <input
                      id={`ticket-price-${ticket.id}`}
                      type="number"
                      min="1"
                      value={
                        ticket.price > 0
                          ? ticket.price
                          : ""
                      }
                      onChange={(event) =>
                        updateTicket(
                          ticket.id,
                          "price",
                          event.target.value === ""
                            ? 0
                            : Number(
                                event.target.value
                              )
                        )
                      }
                      placeholder="10000"
                      className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#432616]"
                    />
                  </div>

                  {/* QUANTITY */}

                  <div>
                    <label
                      htmlFor={`ticket-quantity-${ticket.id}`}
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Quantity
                    </label>

                    <input
                      id={`ticket-quantity-${ticket.id}`}
                      type="number"
                      min="1"
                      value={
                        ticket.quantity > 0
                          ? ticket.quantity
                          : ""
                      }
                      onChange={(event) =>
                        updateTicket(
                          ticket.id,
                          "quantity",
                          event.target.value === ""
                            ? 0
                            : Number(
                                event.target.value
                              )
                        )
                      }
                      placeholder="100"
                      className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#432616]"
                    />
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <label
                      htmlFor={`ticket-description-${ticket.id}`}
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>

                    <input
                      id={`ticket-description-${ticket.id}`}
                      type="text"
                      value={ticket.description ?? ""}
                      onChange={(event) =>
                        updateTicket(
                          ticket.id,
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="General admission"
                      className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#432616]"
                    />
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* ADD TICKET */}

          <button
            type="button"
            onClick={addTicket}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#432616]/40 text-sm font-semibold text-[#432616] transition hover:bg-[#432616]/5"
          >
            <Plus size={18} />
            Add another ticket
          </button>

          {/* SALES PERIOD */}

          <div className="mt-10 border-t border-gray-100 pt-8">

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#432616]/10 text-[#432616]">
                <CalendarDays size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#241507]">
                  Ticket sales period
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Choose when attendees can start and stop
                  purchasing tickets.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>
                <label
                  htmlFor="sales-start"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Sales start
                </label>

                <input
                  id="sales-start"
                  type="datetime-local"
                  value={salesStart}
                  onChange={(event) =>
                    setSalesStart(
                      event.target.value
                    )
                  }
                  className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#432616]"
                />
              </div>

              <div>
                <label
                  htmlFor="sales-end"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Sales end
                </label>

                <input
                  id="sales-end"
                  type="datetime-local"
                  value={salesEnd}
                  onChange={(event) =>
                    setSalesEnd(
                      event.target.value
                    )
                  }
                  className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#432616]"
                />
              </div>

            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* FOOTER */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={goBack}
              className="flex h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white transition hover:opacity-90"
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