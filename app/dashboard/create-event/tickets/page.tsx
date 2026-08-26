"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useCallback,
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

type SelectedTicketType = TicketType | "";

type FreeTicketMode = "unlimited" | "limited";

/* =========================================================
   HYDRATION STORE
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

export default function TicketTypePage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const draftId = searchParams.get("draftId");

  /* =======================================================
     HYDRATION
  ======================================================= */

  const ready = useSyncExternalStore(
    subscribeReady,
    getClientReady,
    getServerReady
  );

  /* =======================================================
     STABLE DRAFT SNAPSHOT
     
     IMPORTANT:
     
     getEventDraft() can return a new object
     reference every time.

     useSyncExternalStore requires the
     snapshot to be cached/stable.

     Therefore we convert the draft to
     a JSON string first.
  ======================================================= */

  const getDraftSnapshot = useCallback(() => {
    if (!draftId) {
      return "";
    }

    const currentDraft =
      getEventDraft(draftId);

    if (!currentDraft) {
      return "";
    }

    return JSON.stringify(currentDraft);
  }, [draftId]);

  const draftSnapshot =
    useSyncExternalStore(
      subscribeToEventDrafts,
      getDraftSnapshot,
      () => ""
    );

  const draft = useMemo(() => {
    if (!draftSnapshot) {
      return null;
    }

    try {
      return JSON.parse(
        draftSnapshot
      ) as NonNullable<
        ReturnType<typeof getEventDraft>
      >;
    } catch (error) {
      console.error(
        "TEEKET: Failed to parse event draft.",
        error
      );

      return null;
    }
  }, [draftSnapshot]);

  /* =======================================================
     FORM OVERRIDES
     
     These are intentionally nullable.

     null = use the value from the draft

     value = user has changed the field
  ======================================================= */

  const [
    ticketTypeOverride,
    setTicketTypeOverride,
  ] =
    useState<
      SelectedTicketType | null
    >(null);

  const [
    freeTicketModeOverride,
    setFreeTicketModeOverride,
  ] =
    useState<
      FreeTicketMode | null
    >(null);

  const [
    freeTicketQuantityOverride,
    setFreeTicketQuantityOverride,
  ] =
    useState<number | null>(null);

  const [
    ticketsOverride,
    setTicketsOverride,
  ] =
    useState<DraftTicket[] | null>(
      null
    );

  /* =======================================================
     EFFECTIVE TICKET TYPE
  ======================================================= */

  const effectiveTicketType =
    ticketTypeOverride ??
    draft?.ticketType ??
    "";

  /* =======================================================
     DRAFT FREE TICKET
  ======================================================= */

  const draftFreeTicket =
    draft?.tickets?.find(
      (ticket) =>
        ticket.price === 0
    );

  /* =======================================================
     EFFECTIVE FREE MODE
  ======================================================= */

  const draftFreeMode: FreeTicketMode =
    draftFreeTicket?.quantity === -1
      ? "unlimited"
      : "limited";

  const effectiveFreeMode =
    freeTicketModeOverride ??
    draftFreeMode;

  /* =======================================================
     EFFECTIVE FREE QUANTITY
  ======================================================= */

  const draftFreeQuantity =
    draftFreeTicket &&
    draftFreeTicket.quantity >= 0
      ? draftFreeTicket.quantity
      : 100;

  const effectiveFreeQuantity =
    freeTicketQuantityOverride ??
    draftFreeQuantity;

  /* =======================================================
     DRAFT PAID TICKETS
  ======================================================= */

  const draftPaidTickets =
    draft?.tickets
      ?.filter(
        (ticket) =>
          ticket.price > 0
      )
      .map((ticket) => ({
        ...ticket,
      })) ?? [];

  /* =======================================================
     EFFECTIVE PAID TICKETS
  ======================================================= */

  const effectiveTickets =
    ticketsOverride ??
    draftPaidTickets;

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
     CHANGE TICKET TYPE
  ======================================================= */

  const handleTicketTypeChange = (
    type: TicketType
  ) => {
    setTicketTypeOverride(type);

    setError("");

    if (type === "free") {
      setTicketsOverride([]);
      return;
    }

    if (
      type === "paid" &&
      effectiveTickets.length === 0
    ) {
      setTicketsOverride([
        createDefaultTicket(),
      ]);

      return;
    }

    if (
      type === "mixed" &&
      effectiveTickets.length === 0
    ) {
      setTicketsOverride([
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
    setTicketsOverride([
      ...effectiveTickets,
      createDefaultTicket(),
    ]);

    setError("");
  };

  /* =======================================================
     UPDATE TICKET
  ======================================================= */

  const updateTicket = (
    id: string,
    values: Partial<DraftTicket>
  ) => {
    setTicketsOverride(
      effectiveTickets.map(
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
    setTicketsOverride(
      effectiveTickets.filter(
        (ticket) =>
          ticket.id !== id
      )
    );

    setError("");
  };

  /* =======================================================
     BUILD FINAL TICKETS
  ======================================================= */

  const buildFinalTickets =
    (): DraftTicket[] => {
      /* ---------------------------------------------------
         FREE
      --------------------------------------------------- */

      if (
        effectiveTicketType ===
        "free"
      ) {
        return [
          createFreeTicket(
            effectiveFreeMode,
            effectiveFreeQuantity
          ),
        ];
      }

      /* ---------------------------------------------------
         PAID
      --------------------------------------------------- */

      if (
        effectiveTicketType ===
        "paid"
      ) {
        return effectiveTickets.map(
          (ticket) => {
            const quantity =
              Math.max(
                1,
                Math.floor(
                  Number(
                    ticket.quantity
                  ) || 0
                )
              );

            const sold =
              Math.max(
                0,
                Number(
                  ticket.sold
                ) || 0
              );

            return {
              ...ticket,
              price: Math.max(
                0,
                Number(
                  ticket.price
                ) || 0
              ),
              quantity,
              sold,
            };
          }
        );
      }

      /* ---------------------------------------------------
         MIXED
      --------------------------------------------------- */

      if (
        effectiveTicketType ===
        "mixed"
      ) {
        const freeTicket =
          createFreeTicket(
            effectiveFreeMode,
            effectiveFreeQuantity
          );

        const paidTickets =
          effectiveTickets.map(
            (ticket) => {
              const quantity =
                Math.max(
                  1,
                  Math.floor(
                    Number(
                      ticket.quantity
                    ) || 0
                  )
                );

              const sold =
                Math.max(
                  0,
                  Number(
                    ticket.sold
                  ) || 0
                );

              return {
                ...ticket,
                price: Math.max(
                  0,
                  Number(
                    ticket.price
                  ) || 0
                ),
                quantity,
                sold,
              };
            }
          );

        return [
          freeTicket,
          ...paidTickets,
        ];
      }

      return [];
    };

  /* =======================================================
     SAVE DRAFT
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

    if (!effectiveTicketType) {
      setError(
        "Please select a ticket type."
      );

      return null;
    }

    const finalTickets =
      buildFinalTickets();

    return saveEventDraft({
      id: draftId,

      ticketType:
        effectiveTicketType,

      tickets:
        finalTickets,

      currentStep:
        nextStep,

      status: "draft",
    });
  };

  /* =======================================================
     SAVE DRAFT BUTTON
  ======================================================= */

  const handleSaveDraft = () => {
    if (saving) {
      return;
    }

    if (!draftId) {
      setError(
        "Event draft could not be found."
      );

      return;
    }

    if (!effectiveTicketType) {
      setError(
        "Please select how you want to sell tickets."
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
      const saved =
        saveDraft("tickets");

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
      if (!effectiveTicketType) {
        setError(
          "Please select how you want to sell tickets."
        );

        return false;
      }

      /* ---------------------------------------------------
         FREE / MIXED
      --------------------------------------------------- */

      if (
        effectiveTicketType ===
          "free" ||
        effectiveTicketType ===
          "mixed"
      ) {
        if (
          effectiveFreeMode ===
          "limited"
        ) {
          if (
            !Number.isFinite(
              effectiveFreeQuantity
            ) ||
            effectiveFreeQuantity <
              1
          ) {
            setError(
              "Please enter a valid number of free tickets."
            );

            return false;
          }
        }
      }

      /* ---------------------------------------------------
         PAID / MIXED
      --------------------------------------------------- */

      if (
        effectiveTicketType ===
          "paid" ||
        effectiveTicketType ===
          "mixed"
      ) {
        if (
          effectiveTickets.length ===
          0
        ) {
          setError(
            "Add at least one paid ticket type."
          );

          return false;
        }

        const invalid =
          effectiveTickets.some(
            (ticket) =>
              !ticket.name.trim() ||
              Number(
                ticket.price
              ) <= 0 ||
              Number(
                ticket.quantity
              ) < 1
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

  const handleContinue = () => {
    if (saving) {
      return;
    }

    if (!draftId || !draft) {
      setError(
        "Event draft could not be found."
      );

      return;
    }

    if (!validateTickets()) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const saved =
        saveDraft("review");

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
      saveDraft("tickets");
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

  if (!draftId || !draft) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] p-5">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-red-700">
            Event draft could not be
            found.
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please return to your events
            and continue from an existing
            draft.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/events"
              )
            }
            className="mt-5 rounded-xl bg-[#432616] px-5 py-3 font-semibold text-white transition hover:opacity-90"
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
              Tickets
            </h1>

            <p className="mt-2 text-gray-500">
              Choose how attendees will
              access your event.
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
            ].map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() =>
                  handleTicketTypeChange(
                    option.type
                  )
                }
                className={`relative rounded-2xl border p-5 text-left transition ${
                  effectiveTicketType ===
                  option.type
                    ? "border-[#432616] bg-[#432616]/5 ring-1 ring-[#432616]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {effectiveTicketType ===
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
            ))}
          </div>

          {/* FREE SETTINGS */}

          {(effectiveTicketType ===
            "free" ||
            effectiveTicketType ===
              "mixed") && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">

              <h2 className="font-semibold text-[#241507]">
                Free ticket availability
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose whether free
                admission is unlimited or
                limited.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                {/* UNLIMITED */}

                <button
                  type="button"
                  onClick={() => {
                    setFreeTicketModeOverride(
                      "unlimited"
                    );

                    setError("");
                  }}
                  className={`rounded-xl border bg-white p-4 text-left transition ${
                    effectiveFreeMode ===
                    "unlimited"
                      ? "border-[#432616] ring-1 ring-[#432616]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        effectiveFreeMode ===
                        "unlimited"
                          ? "border-[#432616] bg-[#432616]"
                          : "border-gray-300"
                      }`}
                    >
                      {effectiveFreeMode ===
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
                        No ticket quantity
                        limit.
                      </p>
                    </div>
                  </div>
                </button>

                {/* LIMITED */}

                <button
                  type="button"
                  onClick={() => {
                    setFreeTicketModeOverride(
                      "limited"
                    );

                    setError("");
                  }}
                  className={`rounded-xl border bg-white p-4 text-left transition ${
                    effectiveFreeMode ===
                    "limited"
                      ? "border-[#432616] ring-1 ring-[#432616]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        effectiveFreeMode ===
                        "limited"
                          ? "border-[#432616] bg-[#432616]"
                          : "border-gray-300"
                      }`}
                    >
                      {effectiveFreeMode ===
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
                        Set a maximum number
                        of attendees.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {effectiveFreeMode ===
                "limited" && (
                <div className="mt-5">
                  <label
                    htmlFor="free-ticket-quantity"
                    className="mb-2 block text-sm font-semibold text-[#241507]"
                  >
                    Number of free tickets
                  </label>

                  <input
                    id="free-ticket-quantity"
                    type="number"
                    min="1"
                    value={
                      effectiveFreeQuantity
                    }
                    onChange={(event) => {
                      const value =
                        Number(
                          event.target.value
                        );

                      setFreeTicketQuantityOverride(
                        Number.isFinite(
                          value
                        )
                          ? value
                          : 0
                      );

                      setError("");
                    }}
                    className="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10 sm:max-w-sm"
                    placeholder="e.g. 100"
                  />
                </div>
              )}
            </div>
          )}

          {/* PAID TICKETS */}

          {(effectiveTicketType ===
            "paid" ||
            effectiveTicketType ===
              "mixed") && (
            <div className="mt-8">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#241507]">
                    Paid ticket types
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add VIP, Premium, VVIP
                    or other paid ticket
                    tiers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addTicket}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#432616] px-5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Plus size={17} />
                  Add Ticket
                </button>
              </div>

              <div className="mt-5 space-y-4">

                {effectiveTickets.length ===
                  0 && (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <p className="font-medium text-[#241507]">
                      No paid tickets yet
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Add your first paid
                      ticket.
                    </p>
                  </div>
                )}

                {effectiveTickets.map(
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
                          <label
                            htmlFor={`ticket-name-${ticket.id}`}
                            className="mb-2 block text-xs font-semibold text-gray-600"
                          >
                            Ticket name
                          </label>

                          <input
                            id={`ticket-name-${ticket.id}`}
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
                            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
                          />
                        </div>

                        {/* PRICE */}

                        <div>
                          <label
                            htmlFor={`ticket-price-${ticket.id}`}
                            className="mb-2 block text-xs font-semibold text-gray-600"
                          >
                            Price (₦)
                          </label>

                          <input
                            id={`ticket-price-${ticket.id}`}
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
                            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
                          />
                        </div>

                        {/* QUANTITY */}

                        <div>
                          <label
                            htmlFor={`ticket-quantity-${ticket.id}`}
                            className="mb-2 block text-xs font-semibold text-gray-600"
                          >
                            Number of tickets
                          </label>

                          <input
                            id={`ticket-quantity-${ticket.id}`}
                            type="number"
                            min="1"
                            value={
                              ticket.quantity
                            }
                            onChange={(
                              event
                            ) => {
                              const quantity =
                                Math.max(
                                  1,
                                  Number(
                                    event
                                      .target
                                      .value
                                  ) || 1
                                );

                              updateTicket(
                                ticket.id,
                                {
                                  quantity,
                                }
                              );
                            }}
                            placeholder="100"
                            className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
                          />
                        </div>
                      </div>

                      {/* DESCRIPTION */}

                      <div className="mt-4">
                        <label
                          htmlFor={`ticket-description-${ticket.id}`}
                          className="mb-2 block text-xs font-semibold text-gray-600"
                        >
                          Description
                          <span className="ml-1 font-normal text-gray-400">
                            (optional)
                          </span>
                        </label>

                        <input
                          id={`ticket-description-${ticket.id}`}
                          value={
                            ticket.description ??
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
                          className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none transition focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* SUMMARY */}

          {effectiveTicketType && (
            <div className="mt-8 rounded-2xl border border-[#432616]/10 bg-[#432616]/5 p-5">
              <h2 className="font-semibold text-[#241507]">
                Ticket summary
              </h2>

              <div className="mt-4 space-y-3">

                {(effectiveTicketType ===
                  "free" ||
                  effectiveTicketType ===
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

                    <p className="text-right text-sm font-semibold text-[#241507]">
                      {effectiveFreeMode ===
                      "unlimited"
                        ? "Unlimited"
                        : `${effectiveFreeQuantity} tickets`}
                    </p>
                  </div>
                )}

                {(effectiveTicketType ===
                  "paid" ||
                  effectiveTicketType ===
                    "mixed") &&
                  effectiveTickets.map(
                    (ticket) => (
                      <div
                        key={`summary-${ticket.id}`}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#241507]">
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

                        <p className="shrink-0 text-sm font-semibold text-[#241507]">
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
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
            >
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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