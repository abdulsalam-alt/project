"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  getEventDraft,
  saveEventDraft,
  type DraftTicket,
  type EventTicketType,
} from "@/lib/dashboard/event";

interface TicketFormProps {
  draftId?: string | null;
}

interface FormErrors {
  ticketType?: string;
  freeTicketQuantity?: string;
  tickets?: string;
}

export default function TicketForm({
  draftId,
}: TicketFormProps) {
  const router = useRouter();

  const draft = draftId
    ? getEventDraft(draftId)
    : null;

  const [ticketType, setTicketType] =
    useState<EventTicketType>(
      draft?.ticketType ?? "free"
    );

  const [freeTicketQuantity, setFreeTicketQuantity] =
    useState<number>(
      draft?.freeTicketQuantity ?? 0
    );

  const [tickets, setTickets] =
    useState<DraftTicket[]>(
      draft?.tickets ?? []
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [saving, setSaving] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Add ticket
  |--------------------------------------------------------------------------
  */

  const addTicket = () => {
    const newTicket: DraftTicket = {
      id: crypto.randomUUID(),

      name: "",

      price: 0,

      description: "",

      available: 0,

      sold: 0,
    };

    setTickets((previous) => [
      ...previous,
      newTicket,
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Update ticket
  |--------------------------------------------------------------------------
  */

  const updateTicket = (
    id: string,
    field: keyof DraftTicket,
    value: string | number
  ) => {
    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              [field]: value,
            }
          : ticket
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Delete ticket
  |--------------------------------------------------------------------------
  */

  const deleteTicket = (
    id: string
  ) => {
    setTickets((previous) =>
      previous.filter(
        (ticket) =>
          ticket.id !== id
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Validate
  |--------------------------------------------------------------------------
  */

  const validate = () => {
    const nextErrors: FormErrors =
      {};

    if (
      ticketType === "free"
    ) {
      if (
        freeTicketQuantity <= 0
      ) {
        nextErrors.freeTicketQuantity =
          "Enter the number of free tickets available.";
      }
    }

    if (
      ticketType === "paid"
    ) {
      if (tickets.length === 0) {
        nextErrors.tickets =
          "Add at least one ticket type.";
      }

      const invalidTicket =
        tickets.some(
          (ticket) =>
            !ticket.name.trim() ||
            ticket.price <= 0 ||
            ticket.available <= 0
        );

      if (invalidTicket) {
        nextErrors.tickets =
          "Complete the ticket name, price and available quantity.";
      }
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const saveDraft = (
    step:
      | "tickets"
      | "details"
      | "location"
  ) => {
    if (!draftId) {
      return null;
    }

    return saveEventDraft({
      id: draftId,

      ticketType,

      freeTicketQuantity:
        ticketType === "free"
          ? freeTicketQuantity
          : 0,

      tickets:
        ticketType === "paid"
          ? tickets
          : [],

      currentStep: step,

      status: "draft",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Save as draft
  |--------------------------------------------------------------------------
  */

  const handleSaveDraft = () => {
    setSaving(true);

    try {
      saveDraft("tickets");

      router.push(
        "/dashboard/events"
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Continue
  |--------------------------------------------------------------------------
  */

  const handleContinue = () => {
    if (!validate()) {
      return;
    }

    if (!draftId) {
      return;
    }

    saveEventDraft({
      id: draftId,

      ticketType,

      freeTicketQuantity:
        ticketType === "free"
          ? freeTicketQuantity
          : 0,

      tickets:
        ticketType === "paid"
          ? tickets
          : [],

      currentStep: "tickets",

      status: "draft",
    });

    /*
     * Later this can become the final
     * publish/review step.
     */

    router.push(
      `/dashboard/create-event/tickets/review?draftId=${encodeURIComponent(
        draftId
      )}`
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}

        <div className="mb-8 flex items-start gap-3">
          <Link
            href={`/dashboard/create-event/location?draftId=${encodeURIComponent(
              draftId ?? ""
            )}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616]"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold text-[#241507] sm:text-3xl">
              Tickets
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Choose how people will attend your event.
            </p>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="mb-8">
          <div className="flex gap-2">
            <div className="h-2 flex-1 rounded-full bg-[#432616]" />
            <div className="h-2 flex-1 rounded-full bg-[#432616]" />
            <div className="h-2 flex-1 rounded-full bg-[#432616]" />
          </div>

          <div className="mt-3 flex justify-between text-[11px] sm:text-sm">
            <span className="text-[#432616]">
              Event Details
            </span>

            <span className="text-[#432616]">
              Location & Time
            </span>

            <span className="font-medium text-[#432616]">
              Tickets
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-8">
          {/* TICKET TYPE */}

          <div>
            <h2 className="text-lg font-semibold text-[#241507]">
              How do you want to sell tickets?
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose whether attendees pay to attend your event.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* FREE */}

              <button
                type="button"
                onClick={() => {
                  setTicketType("free");

                  setErrors({});
                }}
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  ticketType === "free"
                    ? "border-[#432616] bg-[#432616]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[#241507]">
                      Free Event
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Attendees do not pay for tickets.
                    </p>
                  </div>

                  {ticketType ===
                    "free" && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#432616] text-white">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              </button>

              {/* PAID */}

              <button
                type="button"
                onClick={() => {
                  setTicketType("paid");

                  setErrors({});
                }}
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  ticketType === "paid"
                    ? "border-[#432616] bg-[#432616]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[#241507]">
                      Paid Event
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Sell tickets and set your prices.
                    </p>
                  </div>

                  {ticketType ===
                    "paid" && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#432616] text-white">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* FREE EVENT */}

          {ticketType === "free" && (
            <div className="mt-8 rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-[#241507]">
                Free Event Tickets
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Enter the maximum number of attendees you want to allow.
              </p>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-[#241507]">
                  Number of tickets
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    freeTicketQuantity ||
                    ""
                  }
                  onChange={(e) => {
                    setFreeTicketQuantity(
                      Number(
                        e.target.value
                      )
                    );

                    setErrors(
                      (previous) => ({
                        ...previous,
                        freeTicketQuantity:
                          undefined,
                      })
                    );
                  }}
                  placeholder="e.g. 100"
                  className={`h-14 w-full rounded-xl border px-4 outline-none ${
                    errors.freeTicketQuantity
                      ? "border-red-500"
                      : "border-gray-300 focus:border-[#432616]"
                  }`}
                />

                {errors.freeTicketQuantity && (
                  <p className="mt-2 text-sm text-red-500">
                    {
                      errors.freeTicketQuantity
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* PAID EVENT */}

          {ticketType === "paid" && (
            <div className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-[#241507]">
                    Ticket Types
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Create one or more ticket categories.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addTicket}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#432616] px-5 text-sm font-semibold text-white"
                >
                  <Plus size={17} />
                  Add Ticket
                </button>
              </div>

              {errors.tickets && (
                <p className="mt-3 text-sm text-red-500">
                  {errors.tickets}
                </p>
              )}

              <div className="mt-5 space-y-5">
                {tickets.map(
                  (ticket, index) => (
                    <div
                      key={ticket.id}
                      className="rounded-2xl border border-gray-200 p-4 sm:p-6"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <h4 className="font-semibold text-[#241507]">
                          Ticket {index + 1}
                        </h4>

                        <button
                          type="button"
                          onClick={() =>
                            deleteTicket(
                              ticket.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        {/* NAME */}

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#241507]">
                            Ticket Name
                          </label>

                          <input
                            value={
                              ticket.name
                            }
                            onChange={(e) =>
                              updateTicket(
                                ticket.id,
                                "name",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Regular"
                            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
                          />
                        </div>

                        {/* PRICE */}

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#241507]">
                            Price (₦)
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              ticket.price ||
                              ""
                            }
                            onChange={(e) =>
                              updateTicket(
                                ticket.id,
                                "price",
                                Number(
                                  e.target
                                    .value
                                )
                              )
                            }
                            placeholder="5000"
                            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
                          />
                        </div>

                        {/* QUANTITY */}

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#241507]">
                            Number Available
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              ticket.available ||
                              ""
                            }
                            onChange={(e) =>
                              updateTicket(
                                ticket.id,
                                "available",
                                Number(
                                  e.target
                                    .value
                                )
                              )
                            }
                            placeholder="100"
                            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
                          />
                        </div>
                      </div>

                      {/* DESCRIPTION */}

                      <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-[#241507]">
                          Description
                        </label>

                        <textarea
                          value={
                            ticket.description
                          }
                          onChange={(e) =>
                            updateTicket(
                              ticket.id,
                              "description",
                              e.target.value
                            )
                          }
                          rows={3}
                          placeholder="What does this ticket include?"
                          className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#432616]"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* FOOTER */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="h-12 rounded-xl border border-gray-300 px-6 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save as Draft"}
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="h-12 rounded-xl bg-[#432616] px-8 font-semibold text-white hover:opacity-90"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}