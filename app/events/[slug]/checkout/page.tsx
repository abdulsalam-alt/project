"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import {
  ArrowLeft,
  Ticket,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type SelectedTicket = {
  ticketId: string;
  name: string;
  price: number;
  quantity: number;
};

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  price: number
): string {
  const numericPrice =
    Number(price) || 0;

  if (numericPrice <= 0) {
    return "Free";
  }

  return `₦${numericPrice.toLocaleString(
    "en-NG"
  )}`;
}

/* =========================================================
   LOAD SELECTED TICKETS
========================================================= */

function getStoredTickets(): SelectedTicket[] {
  if (
    typeof window === "undefined"
  ) {
    return [];
  }

  try {
    const stored =
      window.sessionStorage.getItem(
        "teeket-selected-tickets"
      );

    if (!stored) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (
        ticket
      ): ticket is SelectedTicket => {
        if (
          typeof ticket !==
            "object" ||
          ticket === null
        ) {
          return false;
        }

        const value =
          ticket as Partial<SelectedTicket>;

        return (
          typeof value.ticketId ===
            "string" &&
          typeof value.name ===
            "string" &&
          typeof value.price ===
            "number" &&
          typeof value.quantity ===
            "number" &&
          value.quantity > 0
        );
      }
    );
  } catch (error) {
    console.error(
      "TEEKET: Failed to load selected tickets.",
      error
    );

    return [];
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function CheckoutPage() {
  const params = useParams();

  const slug =
    typeof params.slug === "string"
      ? decodeURIComponent(params.slug)
      : "";

  /*
   * Lazy initialization.
   *
   * This reads sessionStorage only when
   * the component initializes.
   *
   * No useEffect.
   * No synchronous setState inside an effect.
   */
  const [
    selectedTickets,
  ] = useState<SelectedTicket[]>(
    getStoredTickets
  );

  /* =======================================================
     TOTAL QUANTITY
  ======================================================= */

  const totalQuantity =
    selectedTickets.reduce(
      (total, ticket) =>
        total + ticket.quantity,
      0
    );

  /* =======================================================
     TOTAL PRICE
  ======================================================= */

  const totalPrice =
    selectedTickets.reduce(
      (total, ticket) =>
        total +
        ticket.price *
          ticket.quantity,
      0
    );

  /* =======================================================
     NO TICKETS
  ======================================================= */

  if (!selectedTickets.length) {
    return (
      <main className="min-h-screen bg-[#F7F7F7]">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-5">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            {/* ICON */}

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#432616]/10">
              <Ticket
                size={28}
                className="text-[#432616]"
              />
            </div>

            {/* TITLE */}

            <h1 className="mt-5 text-2xl font-bold text-[#241507]">
              No tickets selected
            </h1>

            {/* DESCRIPTION */}

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Please select your tickets
              before continuing to
              checkout.
            </p>

            {/* BUTTON */}

            <Link
              href={`/events/${encodeURIComponent(
                slug
              )}`}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#432616] px-6 font-semibold text-white transition hover:bg-[#2f1a0e]"
            >
              Select Tickets
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     CHECKOUT
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-12">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          href={`/events/${encodeURIComponent(
            slug
          )}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#432616] transition hover:opacity-70"
        >
          <ArrowLeft size={18} />

          Back to event
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mt-8">
          <p className="text-sm font-semibold text-[#432616]">
            Checkout
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#241507] sm:text-4xl">
            Complete your ticket order
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Review your selected tickets
            before proceeding.
          </p>
        </div>

        {/* =================================================
            ORDER CARD
        ================================================= */}

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

          {/* TITLE */}

          <h2 className="text-lg font-bold text-[#241507]">
            Your tickets
          </h2>

          {/* TICKETS */}

          <div className="mt-5 space-y-3">
            {selectedTickets.map(
              (ticket) => (
                <div
                  key={ticket.ticketId}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8F6F4] p-4"
                >
                  {/* INFO */}

                  <div className="min-w-0">
                    <p className="font-semibold text-[#241507]">
                      {ticket.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {ticket.quantity}{" "}
                      ×{" "}
                      {formatPrice(
                        ticket.price
                      )}
                    </p>
                  </div>

                  {/* SUBTOTAL */}

                  <p className="shrink-0 font-bold text-[#432616]">
                    {formatPrice(
                      ticket.price *
                        ticket.quantity
                    )}
                  </p>
                </div>
              )
            )}
          </div>

          {/* =================================================
              TOTAL
          ================================================= */}

          <div className="mt-6 border-t border-gray-100 pt-6">

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Total tickets
              </span>

              <span className="font-semibold text-[#241507]">
                {totalQuantity}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold text-[#241507]">
                Total
              </span>

              <span className="text-2xl font-bold text-[#432616]">
                {formatPrice(
                  totalPrice
                )}
              </span>
            </div>
          </div>

          {/* =================================================
              CONTINUE
          ================================================= */}

          <button
            type="button"
            onClick={() => {
              /*
               * Next step will be attendee
               * information.
               */
              console.log(
                "Proceeding to attendee details",
                selectedTickets
              );
            }}
            className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-[#432616] px-6 font-semibold text-white transition hover:bg-[#2f1a0e]"
          >
            Continue to attendee details
          </button>
        </div>
      </div>
    </main>
  );
}