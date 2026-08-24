"use client";

import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
  useSyncExternalStore,
} from "react";

import {
  getEventDraft,
  saveEventDraft,
  subscribeToEventDrafts,
  type TicketType,
} from "@/lib/dashboard/eventDraft";

interface TicketTypeFormProps {
  draftId: string | null;
}

function readySubscribe() {
  return () => {};
}

function clientReady() {
  return true;
}

function serverReady() {
  return false;
}

export default function TicketTypeForm({
  draftId,
}: TicketTypeFormProps) {
  const router = useRouter();

  const ready =
    useSyncExternalStore(
      readySubscribe,
      clientReady,
      serverReady
    );

  const draft =
    useSyncExternalStore(
      subscribeToEventDrafts,
      () => getEventDraft(draftId),
      () => null
    );

  const [
    ticketType,
    setTicketType,
  ] = useState<
    "free" | "paid" | ""
  >(
    () => draft?.ticketType ?? ""
  );

  const [tickets, setTickets] =
    useState<TicketType[]>(
      () => draft?.tickets ?? []
    );

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const addTicket = () => {
    const ticket: TicketType = {
      id:
        typeof crypto !==
          "undefined" &&
        crypto.randomUUID
          ? crypto.randomUUID()
          : `ticket-${Date.now()}`,

      name: "General Admission",

      price: 0,

      quantity: 100,

      sold: 0,
    };

    setTickets((current) => [
      ...current,
      ticket,
    ]);
  };

  const updateTicket = (
    id: string,
    values: Partial<TicketType>
  ) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              ...values,
            }
          : ticket
      )
    );
  };

  const removeTicket = (
    id: string
  ) => {
    setTickets((current) =>
      current.filter(
        (ticket) =>
          ticket.id !== id
      )
    );
  };

  const saveDraft = (
    nextStep: "ticket-type" | "review"
  ) => {
    if (!draftId) {
      setError(
        "Event draft could not be found."
      );

      return null;
    }

    return saveEventDraft({
      id: draftId,

      ticketType,

      tickets:
        ticketType === "free"
          ? [
              {
                id: "free-ticket",
                name: "Free Ticket",
                price: 0,
                quantity: 999999,
                sold: 0,
              },
            ]
          : tickets,

      currentStep: nextStep,

      status: "draft",
    });
  };

  const handleSaveDraft = () => {
    setSaving(true);

    saveDraft("ticket-type");

    setSaving(false);

    router.push(
      "/dashboard/events"
    );
  };

  const handleContinue = () => {
    if (!draftId || !draft) {
      setError(
        "Event draft could not be found."
      );

      return;
    }

    if (!ticketType) {
      setError(
        "Please select a ticket type."
      );

      return;
    }

    if (
      ticketType === "paid" &&
      tickets.length === 0
    ) {
      setError(
        "Add at least one paid ticket."
      );

      return;
    }

    if (
      ticketType === "paid"
    ) {
      const invalid =
        tickets.some(
          (ticket) =>
            !ticket.name.trim() ||
            ticket.price < 0 ||
            ticket.quantity < 1
        );

      if (invalid) {
        setError(
          "Check your ticket name, price and quantity."
        );

        return;
      }
    }

    setSaving(true);

    saveDraft("review");

    setSaving(false);

    router.push(
      `/dashboard/create-event/review?draftId=${encodeURIComponent(
        draftId
      )}`
    );
  };

  const handleBack = () => {
    if (!draftId) {
      router.push(
        "/dashboard/create-event"
      );

      return;
    }

    saveDraft("ticket-type");

    router.push(
      `/dashboard/create-event/location?draftId=${encodeURIComponent(
        draftId
      )}`
    );
  };

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="mt-8 h-[500px] rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (!draftId || !draft) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] p-5">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-red-700">
            Event draft could not be
            found.
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/events"
              )
            }
            className="mt-5 rounded-xl bg-[#432616] px-5 py-3 font-semibold text-white"
          >
            Back to Events
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
              Tickets
            </h1>

            <p className="mt-2 text-gray-500">
              Configure how attendees
              will get tickets.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">
          <h2 className="text-lg font-semibold text-[#241507]">
            Ticket type
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setTicketType(
                  "free"
                );
                setError("");
              }}
              className={`rounded-2xl border p-5 text-left ${
                ticketType === "free"
                  ? "border-[#432616] bg-[#432616]/5"
                  : "border-gray-200"
              }`}
            >
              <p className="font-semibold text-[#241507]">
                Free event
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Attendees don't pay
                for tickets.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setTicketType(
                  "paid"
                );
                setError("");
              }}
              className={`rounded-2xl border p-5 text-left ${
                ticketType === "paid"
                  ? "border-[#432616] bg-[#432616]/5"
                  : "border-gray-200"
              }`}
            >
              <p className="font-semibold text-[#241507]">
                Paid event
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Sell tickets to
                attendees.
              </p>
            </button>
          </div>

          {ticketType ===
            "paid" && (
            <div className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-[#241507]">
                  Ticket types
                </h2>

                <button
                  type="button"
                  onClick={addTicket}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#432616] px-4 text-sm font-semibold text-white"
                >
                  <Plus size={16} />
                  Add Ticket
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {tickets.length ===
                  0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                    No ticket types
                    yet.
                  </div>
                )}

                {tickets.map(
                  (ticket) => (
                    <div
                      key={
                        ticket.id
                      }
                      className="rounded-2xl border border-gray-200 p-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-3">
                        <input
                          value={
                            ticket.name
                          }
                          onChange={(
                            event
                          ) =>
                            updateTicket(
                              ticket.id,
                              {
                                name: event
                                  .target
                                  .value,
                              }
                            )
                          }
                          placeholder="Ticket name"
                          className="h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
                        />

                        <input
                          type="number"
                          min="0"
                          value={
                            ticket.price
                          }
                          onChange={(
                            event
                          ) =>
                            updateTicket(
                              ticket.id,
                              {
                                price: Number(
                                  event
                                    .target
                                    .value
                                ),
                              }
                            )
                          }
                          placeholder="Price"
                          className="h-12 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
                        />

                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            value={
                              ticket.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateTicket(
                                ticket.id,
                                {
                                  quantity:
                                    Number(
                                      event
                                        .target
                                        .value
                                    ),
                                }
                              )
                            }
                            placeholder="Quantity"
                            className="h-12 min-w-0 flex-1 rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeTicket(
                                ticket.id
                              )
                            }
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#432616] bg-white px-6 font-semibold text-[#432616]"
            >
              <Save size={18} />
              Save Draft
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="h-12 rounded-xl border border-gray-300 px-6 font-medium"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleContinue}
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white disabled:opacity-50"
              >
                Continue
                <ArrowRight
                  size={18}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}