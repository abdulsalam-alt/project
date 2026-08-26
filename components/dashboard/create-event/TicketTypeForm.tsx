"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  getEventDraft,
  saveEventDraft,
  subscribeToEventDrafts,
  type DraftTicket,
  type TicketType,
} from "@/lib/dashboard/eventDraft";

/* =========================================================
   TYPES
========================================================= */

interface TicketTypeFormProps {
  draftId: string | null;
}

type SelectedTicketType = TicketType | "";

type FreeTicketMode =
  | "unlimited"
  | "limited";

/* =========================================================
   HYDRATION
========================================================= */

function subscribeReady(
  callback: () => void
): () => void {
  void callback;

  return () => {};
}

function getClientReady(): boolean {
  return true;
}

function getServerReady(): boolean {
  return false;
}

/* =========================================================
   TICKET HELPERS
========================================================= */

function createTicketId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `ticket-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function createDefaultTicket(): DraftTicket {
  return {
    id: createTicketId(),

    name: "General Admission",

    price: 0,

    quantity: 100,

    available: 100,

    sold: 0,

    description: "",
  };
}

function createFreeTicket(
  mode: FreeTicketMode,
  quantity: number
): DraftTicket {
  const finalQuantity =
    mode === "unlimited"
      ? -1
      : Math.max(
          1,
          Math.floor(
            Number(quantity) || 0
          )
        );

  return {
    id: "free-general-admission",

    name: "General Admission",

    price: 0,

    quantity: finalQuantity,

    available: finalQuantity,

    sold: 0,

    description: "Free admission",
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TicketTypeForm({
  draftId,
}: TicketTypeFormProps) {
  const router = useRouter();

  /* =======================================================
     READY
  ======================================================= */

  const ready =
    useSyncExternalStore(
      subscribeReady,
      getClientReady,
      getServerReady
    );

  /* =======================================================
     DRAFT
  ======================================================= */

  const draft =
    useSyncExternalStore(
      subscribeToEventDrafts,
      () =>
        draftId
          ? getEventDraft(draftId)
          : null,
      () => null
    );

  /* =======================================================
     INITIAL DRAFT DATA
  ======================================================= */

  const initialTicketType =
    useMemo<SelectedTicketType>(() => {
      return draft?.ticketType ?? "";
    }, [draft]);

  const initialFreeTicket =
    useMemo(() => {
      return draft?.tickets?.find(
        (ticket) => ticket.price === 0
      );
    }, [draft]);

  const initialPaidTickets =
    useMemo<DraftTicket[]>(() => {
      if (!draft?.tickets) {
        return [];
      }

      return draft.tickets
        .filter(
          (ticket) => ticket.price > 0
        )
        .map((ticket) => ({
          ...ticket,
        }));
    }, [draft]);

  /* =======================================================
     TICKET TYPE
  ======================================================= */

  const [
    ticketType,
    setTicketType,
  ] =
    useState<SelectedTicketType>(
      ""
    );

  /* =======================================================
     FREE MODE
  ======================================================= */

  const [
    freeTicketMode,
    setFreeTicketMode,
  ] =
    useState<FreeTicketMode>(
      "limited"
    );

  /* =======================================================
     FREE QUANTITY
  ======================================================= */

  const [
    freeTicketQuantity,
    setFreeTicketQuantity,
  ] =
    useState<number>(100);

  /* =======================================================
     PAID TICKETS
  ======================================================= */

  const [
    tickets,
    setTickets,
  ] =
    useState<DraftTicket[]>([]);

  /* =======================================================
     TRACK INITIALIZATION
  ======================================================= */

  const [
    initializedDraftId,
    setInitializedDraftId,
  ] = useState<string | null>(
    null
  );

  /*
   * We intentionally derive whether the local form has
   * been initialized from the current draft.
   *
   * No useEffect is used here.
   */

  const shouldInitialize =
    ready &&
    !!draftId &&
    !!draft &&
    initializedDraftId !== draftId;

  /*
   * Initialize during render only when the external draft
   * becomes available.
   *
   * React's state setter here is guarded so it happens once
   * for the current draft.
   */

  if (shouldInitialize) {
    setInitializedDraftId(
      draftId
    );

    setTicketType(
      initialTicketType
    );

    setTickets(
      initialPaidTickets
    );

    if (
      initialFreeTicket
    ) {
      if (
        initialFreeTicket.quantity ===
        -1
      ) {
        setFreeTicketMode(
          "unlimited"
        );
      } else {
        setFreeTicketMode(
          "limited"
        );

        setFreeTicketQuantity(
          initialFreeTicket.quantity
        );
      }
    } else {
      setFreeTicketMode(
        "limited"
      );

      setFreeTicketQuantity(
        100
      );
    }
  }

  /* =======================================================
     UI STATE
  ======================================================= */

  const [
    error,
    setError,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  /* =======================================================
     CHANGE TYPE
  ======================================================= */

  const handleTicketTypeChange = (
    type: TicketType
  ) => {
    setTicketType(type);

    setError("");

    /*
     * PAID
     */

    if (
      type === "paid" &&
      tickets.length === 0
    ) {
      setTickets([
        createDefaultTicket(),
      ]);

      return;
    }

    /*
     * MIXED
     */

    if (
      type === "mixed" &&
      tickets.length === 0
    ) {
      setTickets([
        {
          ...createDefaultTicket(),

          name: "VIP",

          price: 20000,
        },
      ]);
    }
  };

  /* =======================================================
     ADD TICKET
  ======================================================= */

  const addTicket = () => {
    setTickets(
      (current) => [
        ...current,
        createDefaultTicket(),
      ]
    );

    setError("");
  };

  /* =======================================================
     UPDATE TICKET
  ======================================================= */

  const updateTicket = (
    id: string,
    values: Partial<DraftTicket>
  ) => {
    setTickets(
      (current) =>
        current.map(
          (ticket) =>
            ticket.id === id
              ? {
                  ...ticket,
                  ...values,
                }
              : ticket
        )
    );

    setError("");
  };

  /* =======================================================
     REMOVE TICKET
  ======================================================= */

  const removeTicket = (
    id: string
  ) => {
    setTickets(
      (current) =>
        current.filter(
          (ticket) =>
            ticket.id !== id
        )
    );

    setError("");
  };

  /* =======================================================
     BUILD PAID TICKET
  ======================================================= */

  const normalizePaidTicket = (
    ticket: DraftTicket
  ): DraftTicket => {
    const quantity = Math.max(
      1,
      Math.floor(
        Number(ticket.quantity) || 0
      )
    );

    const price = Math.max(
      0,
      Number(ticket.price) || 0
    );

    const sold = Math.max(
      0,
      Number(ticket.sold) || 0
    );

    return {
      ...ticket,

      price,

      quantity,

      sold,

      available: Math.max(
        0,
        quantity - sold
      ),
    };
  };

  /* =======================================================
     BUILD FINAL TICKETS
  ======================================================= */

  const buildFinalTickets =
    (): DraftTicket[] => {
      /*
       * FREE
       */

      if (
        ticketType === "free"
      ) {
        return [
          createFreeTicket(
            freeTicketMode,
            freeTicketQuantity
          ),
        ];
      }

      /*
       * PAID
       */

      if (
        ticketType === "paid"
      ) {
        return tickets.map(
          normalizePaidTicket
        );
      }

      /*
       * MIXED
       */

      if (
        ticketType === "mixed"
      ) {
        const freeTicket =
          createFreeTicket(
            freeTicketMode,
            freeTicketQuantity
          );

        const paidTickets =
          tickets.map(
            normalizePaidTicket
          );

        return [
          freeTicket,
          ...paidTickets,
        ];
      }

      return [];
    };

  /* =======================================================
     SAVE
  ======================================================= */

  const saveDraft = (
    nextStep:
      | "tickets"
      | "review"
  ) => {
    if (!draftId) {
      setError(
        "Event draft could not be found."
      );

      return null;
    }

    if (!ticketType) {
      setError(
        "Please select a ticket type."
      );

      return null;
    }

    const finalTickets =
      buildFinalTickets();

    return saveEventDraft({
      id: draftId,

      ticketType,

      tickets:
        finalTickets,

      currentStep:
        nextStep,

      status:
        "draft",
    });
  };

  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  const handleSaveDraft =
    () => {
      if (saving) {
        return;
      }

      if (!draftId) {
        setError(
          "Event draft could not be found."
        );

        return;
      }

      setError("");
      setSaving(true);

      try {
        const saved =
          saveDraft(
            "tickets"
          );

        if (!saved) {
          setSaving(false);
          return;
        }

        router.push(
          `/dashboard/events?draftSaved=${encodeURIComponent(
            saved.id
          )}`
        );
      } catch (error) {
        console.error(
          "TEEKET: Failed to save ticket draft.",
          error
        );

        setError(
          "Unable to save your draft. Please try again."
        );

        setSaving(false);
      }
    };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateTickets =
    (): boolean => {
      if (!ticketType) {
        setError(
          "Please select how you want to sell tickets."
        );

        return false;
      }

      /*
       * FREE / MIXED FREE
       */

      if (
        ticketType === "free" ||
        ticketType === "mixed"
      ) {
        if (
          freeTicketMode ===
          "limited"
        ) {
          if (
            !Number.isFinite(
              freeTicketQuantity
            ) ||
            freeTicketQuantity <
              1
          ) {
            setError(
              "Please enter a valid number of free tickets."
            );

            return false;
          }
        }
      }

      /*
       * PAID / MIXED PAID
       */

      if (
        ticketType === "paid" ||
        ticketType === "mixed"
      ) {
        if (
          tickets.length === 0
        ) {
          setError(
            "Add at least one paid ticket type."
          );

          return false;
        }

        const invalid =
          tickets.some(
            (ticket) => {
              const price =
                Number(
                  ticket.price
                );

              const quantity =
                Number(
                  ticket.quantity
                );

              return (
                !ticket.name.trim() ||
                !Number.isFinite(
                  price
                ) ||
                price <= 0 ||
                !Number.isFinite(
                  quantity
                ) ||
                quantity < 1
              );
            }
          );

        if (invalid) {
          setError(
            "Check your ticket name, price and quantity. Paid tickets must have a price greater than ₦0."
          );

          return false;
        }
      }

      return true;
    };

  /* =======================================================
     CONTINUE
  ======================================================= */

  const handleContinue =
    () => {
      if (saving) {
        return;
      }

      if (
        !draftId ||
        !draft
      ) {
        setError(
          "Event draft could not be found."
        );

        return;
      }

      if (
        !validateTickets()
      ) {
        return;
      }

      setSaving(true);
      setError("");

      try {
        const saved =
          saveDraft(
            "review"
          );

        if (!saved) {
          setError(
            "Unable to save ticket information."
          );

          setSaving(false);

          return;
        }

        router.push(
          `/dashboard/create-event/review?draftId=${encodeURIComponent(
            saved.id
          )}`
        );
      } catch (error) {
        console.error(
          "TEEKET: Failed to continue.",
          error
        );

        setError(
          "Unable to save ticket information."
        );

        setSaving(false);
      }
    };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    if (!draftId) {
      router.push(
        "/dashboard/create-event"
      );

      return;
    }

    try {
      saveDraft(
        "tickets"
      );
    } catch (error) {
      console.error(
        "TEEKET: Failed to save before going back.",
        error
      );
    }

    router.push(
      `/dashboard/create-event/location?draftId=${encodeURIComponent(
        draftId
      )}`
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-8 w-40 rounded bg-gray-200" />

          <div className="mt-3 h-5 w-72 rounded bg-gray-200" />

          <div className="mt-8 h-[600px] rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  /* =======================================================
     NO DRAFT
  ======================================================= */

  if (
    !draftId ||
    !draft
  ) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] p-5">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-red-700">
            Event draft could not be
            found.
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please return to your
            events and continue from
            an existing draft.
          </p>

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

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={saving}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616] transition hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
              Tickets
            </h1>

            <p className="mt-2 text-gray-500">
              Choose how attendees
              will access your event.
            </p>
          </div>
        </div>

        {/* MAIN CARD */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">

          {/* TICKET TYPE */}

          <div>
            <h2 className="text-lg font-semibold text-[#241507]">
              How do you want to sell
              tickets?
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose free admission,
              paid tickets, or free
              admission with premium
              ticket options.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            {[
              {
                type: "free" as const,
                icon: "🎟️",
                title: "Free Event",
                description:
                  "Free admission with unlimited or limited tickets.",
              },
              {
                type: "paid" as const,
                icon: "💳",
                title: "Paid Event",
                description:
                  "Sell one or more paid ticket types.",
              },
              {
                type: "mixed" as const,
                icon: "⭐",
                title: "Free + VIP",
                description:
                  "Free admission alongside VIP or premium tickets.",
              },
            ].map(
              (option) => (
                <button
                  key={
                    option.type
                  }
                  type="button"
                  onClick={() =>
                    handleTicketTypeChange(
                      option.type
                    )
                  }
                  className={`relative rounded-2xl border p-5 text-left transition ${
                    ticketType ===
                    option.type
                      ? "border-[#432616] bg-[#432616]/5 ring-1 ring-[#432616]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {ticketType ===
                    option.type && (
                    <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#432616] text-white">
                      <Check size={14} />
                    </span>
                  )}

                  <div className="text-2xl">
                    {option.icon}
                  </div>

                  <h3 className="mt-4 font-semibold text-[#241507]">
                    {option.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {option.description}
                  </p>
                </button>
              )
            )}
          </div>

          {/* FREE SETTINGS */}

          {(ticketType === "free" ||
            ticketType === "mixed") && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">

              <h2 className="font-semibold text-[#241507]">
                Free ticket
                availability
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose whether free
                admission is unlimited
                or limited.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                {/* UNLIMITED */}

                <button
                  type="button"
                  onClick={() =>
                    setFreeTicketMode(
                      "unlimited"
                    )
                  }
                  className={`rounded-xl border bg-white p-4 text-left ${
                    freeTicketMode ===
                    "unlimited"
                      ? "border-[#432616] ring-1 ring-[#432616]"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        freeTicketMode ===
                        "unlimited"
                          ? "border-[#432616] bg-[#432616]"
                          : "border-gray-300"
                      }`}
                    >
                      {freeTicketMode ===
                        "unlimited" && (
                        <Check
                          size={12}
                          className="text-white"
                        />
                      )}
                    </span>

                    <div>
                      <p className="font-medium text-[#241507]">
                        Unlimited
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        No ticket
                        quantity limit.
                      </p>
                    </div>
                  </div>
                </button>

                {/* LIMITED */}

                <button
                  type="button"
                  onClick={() =>
                    setFreeTicketMode(
                      "limited"
                    )
                  }
                  className={`rounded-xl border bg-white p-4 text-left ${
                    freeTicketMode ===
                    "limited"
                      ? "border-[#432616] ring-1 ring-[#432616]"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        freeTicketMode ===
                        "limited"
                          ? "border-[#432616] bg-[#432616]"
                          : "border-gray-300"
                      }`}
                    >
                      {freeTicketMode ===
                        "limited" && (
                        <Check
                          size={12}
                          className="text-white"
                        />
                      )}
                    </span>

                    <div>
                      <p className="font-medium text-[#241507]">
                        Limited
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Set a maximum
                        number of
                        attendees.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {freeTicketMode ===
                "limited" && (
                <div className="mt-5">
                  <label
                    htmlFor="free-ticket-quantity"
                    className="mb-2 block text-sm font-semibold text-[#241507]"
                  >
                    Number of free
                    tickets
                  </label>

                  <input
                    id="free-ticket-quantity"
                    type="number"
                    min="1"
                    value={
                      freeTicketQuantity
                    }
                    onChange={(
                      event
                    ) => {
                      const value =
                        Number(
                          event.target
                            .value
                        );

                      setFreeTicketQuantity(
                        Number.isFinite(
                          value
                        )
                          ? value
                          : 0
                      );
                    }}
                    className="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none focus:border-[#432616] sm:max-w-sm"
                    placeholder="e.g. 100"
                  />
                </div>
              )}
            </div>
          )}

          {/* PAID TICKETS */}

          {(ticketType === "paid" ||
            ticketType === "mixed") && (
            <div className="mt-8">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#241507]">
                    Paid ticket types
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add VIP, Premium,
                    VVIP or other paid
                    ticket tiers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    addTicket
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#432616] px-5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Plus size={17} />

                  Add Ticket
                </button>
              </div>

              <div className="mt-5 space-y-4">

                {tickets.length ===
                  0 && (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <p className="font-medium text-[#241507]">
                      No paid tickets
                      yet
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Add your first
                      paid ticket.
                    </p>
                  </div>
                )}

                {tickets.map(
                  (
                    ticket,
                    index
                  ) => (
                    <div
                      key={
                        ticket.id
                      }
                      className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
                    >

                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#241507]">
                          Ticket{" "}
                          {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeTicket(
                              ticket.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                          aria-label="Remove ticket"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">

                        {/* NAME */}

                        <div>
                          <label className="mb-2 block text-xs font-semibold text-gray-600">
                            Ticket name
                          </label>

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
                                  name:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                            placeholder="VIP"
                            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
                          />
                        </div>

                        {/* PRICE */}

                        <div>
                          <label className="mb-2 block text-xs font-semibold text-gray-600">
                            Price (₦)
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              ticket.price
                            }
                            onChange={(
                              event
                            ) =>
                              updateTicket(
                                ticket.id,
                                {
                                  price:
                                    Number(
                                      event
                                        .target
                                        .value
                                    ) || 0,
                                }
                              )
                            }
                            placeholder="20000"
                            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
                          />
                        </div>

                        {/* QUANTITY */}

                        <div>
                          <label className="mb-2 block text-xs font-semibold text-gray-600">
                            Number of
                            tickets
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              ticket.quantity
                            }
                            onChange={(
                              event
                            ) => {
                              const value =
                                Number(
                                  event
                                    .target
                                    .value
                                );

                              updateTicket(
                                ticket.id,
                                {
                                  quantity:
                                    Number.isFinite(
                                      value
                                    )
                                      ? value
                                      : 0,
                                }
                              );
                            }}
                            placeholder="100"
                            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
                          />
                        </div>
                      </div>

                      {/* DESCRIPTION */}

                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          Description
                          <span className="ml-1 font-normal text-gray-400">
                            (optional)
                          </span>
                        </label>

                        <input
                          value={
                            ticket.description ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateTicket(
                              ticket.id,
                              {
                                description:
                                  event
                                    .target
                                    .value,
                              }
                            )
                          }
                          placeholder="What does this ticket include?"
                          className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* SUMMARY */}

          {ticketType && (
            <div className="mt-8 rounded-2xl border border-[#432616]/10 bg-[#432616]/5 p-5">

              <h2 className="font-semibold text-[#241507]">
                Ticket summary
              </h2>

              <div className="mt-4 space-y-3">

                {(ticketType ===
                  "free" ||
                  ticketType ===
                    "mixed") && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-[#241507]">
                        General Admission
                      </p>

                      <p className="text-sm text-gray-500">
                        Free
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-[#241507]">
                      {freeTicketMode ===
                      "unlimited"
                        ? "Unlimited"
                        : `${freeTicketQuantity} tickets`}
                    </p>
                  </div>
                )}

                {(ticketType ===
                  "paid" ||
                  ticketType ===
                    "mixed") &&
                  tickets.map(
                    (ticket) => (
                      <div
                        key={
                          `summary-${ticket.id}`
                        }
                        className="flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-medium text-[#241507]">
                            {ticket.name ||
                              "Unnamed ticket"}
                          </p>

                          <p className="text-sm text-gray-500">
                            ₦
                            {Number(
                              ticket.price
                            ).toLocaleString()}
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-[#241507]">
                          {
                            ticket.quantity
                          }{" "}
                          tickets
                        </p>
                      </div>
                    )
                  )}
              </div>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* ACTIONS */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

            <button
              type="button"
              onClick={
                handleSaveDraft
              }
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#432616] bg-white px-6 font-semibold text-[#432616] transition hover:bg-[#432616]/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={
                  handleBack
                }
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowLeft
                  size={17}
                />

                Back
              </button>

              <button
                type="button"
                onClick={
                  handleContinue
                }
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Continue"}

                {!saving && (
                  <ArrowRight
                    size={18}
                  />
                )}
              </button>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}