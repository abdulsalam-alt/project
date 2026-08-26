"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Ticket,
} from "lucide-react";

import type { EventTicket } from "@/lib/data/event";

interface TicketSelectionProps {
  tickets: EventTicket[];
  eventSlug: string;
}

export type SelectedTicket = {
  ticketId: string;
  name: string;
  price: number;
  quantity: number;
};

const MAX_TICKETS_PER_TYPE = 10;

function getAvailableTickets(
  ticket: EventTicket
): number {
  if (typeof ticket.available === "number") {
    return ticket.available;
  }

  if (ticket.quantity === -1) {
    return -1;
  }

  const sold = Number(ticket.sold) || 0;

  return Math.max(
    0,
    ticket.quantity - sold
  );
}

function formatPrice(price: number): string {
  const numericPrice = Number(price) || 0;

  if (numericPrice <= 0) {
    return "Free";
  }

  return `₦${numericPrice.toLocaleString("en-NG")}`;
}

export default function TicketSelection({
  tickets,
  eventSlug,
}: TicketSelectionProps) {
  const router = useRouter();

  const [selected, setSelected] =
    useState<Record<string, number>>({});

  const updateQuantity = (
    ticket: EventTicket,
    nextQuantity: number
  ) => {
    const available =
      getAvailableTickets(ticket);

    const maximum =
      available === -1
        ? MAX_TICKETS_PER_TYPE
        : Math.min(
            Math.max(0, available),
            MAX_TICKETS_PER_TYPE
          );

    const safeQuantity = Math.max(
      0,
      Math.min(
        nextQuantity,
        maximum
      )
    );

    setSelected((current) => ({
      ...current,
      [ticket.id]: safeQuantity,
    }));
  };

  const totalQuantity =
    tickets.reduce(
      (total, ticket) =>
        total +
        (selected[ticket.id] || 0),
      0
    );

  const totalPrice =
    tickets.reduce(
      (total, ticket) => {
        const quantity =
          selected[ticket.id] || 0;

        return (
          total +
          (Number(ticket.price) || 0) *
            quantity
        );
      },
      0
    );

  const handleContinue = () => {
    if (totalQuantity <= 0) {
      return;
    }

    const selectedTickets: SelectedTicket[] =
      tickets
        .filter(
          (ticket) =>
            (selected[ticket.id] || 0) > 0
        )
        .map((ticket) => ({
          ticketId: ticket.id,
          name:
            ticket.name || "Ticket",
          price:
            Number(ticket.price) || 0,
          quantity:
            selected[ticket.id] || 0,
        }));

    /*
     * Save selected tickets temporarily.
     *
     * This allows the checkout page to
     * access the selection after navigation.
     */
    sessionStorage.setItem(
      "teeket-selected-tickets",
      JSON.stringify(selectedTickets)
    );

    /*
     * Also save the event slug so the
     * checkout page knows which event
     * the user is buying tickets for.
     */
    sessionStorage.setItem(
      "teeket-checkout-event",
      eventSlug
    );

    /*
     * Move to checkout page.
     */
    router.push(
      `/events/${encodeURIComponent(
        eventSlug
      )}/checkout`
    );
  };

  if (!tickets.length) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <Ticket
          size={26}
          className="mx-auto text-gray-400"
        />

        <p className="mt-3 text-sm font-medium text-gray-600">
          Tickets are not available
          for this event.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="space-y-4">
        {tickets.map((ticket) => {
          const quantity =
            selected[ticket.id] || 0;

          const available =
            getAvailableTickets(ticket);

          const soldOut =
            available === 0;

          const maximum =
            available === -1
              ? MAX_TICKETS_PER_TYPE
              : Math.min(
                  Math.max(0, available),
                  MAX_TICKETS_PER_TYPE
                );

          return (
            <div
              key={ticket.id}
              className={`rounded-2xl border p-4 transition sm:p-5 ${
                quantity > 0
                  ? "border-[#432616] bg-[#432616]/[0.03]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#241507]">
                      {ticket.name || "Ticket"}
                    </h3>

                    {soldOut && (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                        Sold out
                      </span>
                    )}
                  </div>

                  {ticket.description && (
                    <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
                      {ticket.description}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="text-sm font-bold text-[#432616]">
                      {formatPrice(ticket.price)}
                    </p>

                    {!soldOut && (
                      <span className="text-xs text-gray-400">
                        {available === -1
                          ? "Unlimited available"
                          : `${available} available`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                  <span className="text-xs font-medium text-gray-400 sm:hidden">
                    Quantity
                  </span>

                  <div
                    className={`flex h-11 items-center overflow-hidden rounded-xl border ${
                      soldOut
                        ? "border-gray-200 bg-gray-100"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          ticket,
                          quantity - 1
                        )
                      }
                      disabled={
                        soldOut ||
                        quantity <= 0
                      }
                      aria-label={`Decrease ${ticket.name} quantity`}
                      className="flex h-full w-11 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="flex w-10 items-center justify-center text-sm font-semibold text-[#241507]">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          ticket,
                          quantity + 1
                        )
                      }
                      disabled={
                        soldOut ||
                        quantity >= maximum
                      }
                      aria-label={`Increase ${ticket.name} quantity`}
                      className="flex h-full w-11 items-center justify-center text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-[#F8F6F4] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Selected tickets
            </p>

            <p className="mt-1 text-sm font-semibold text-[#241507]">
              {totalQuantity === 0
                ? "No tickets selected"
                : `${totalQuantity} ${
                    totalQuantity === 1
                      ? "ticket"
                      : "tickets"
                  }`}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Total
            </p>

            <p className="mt-1 text-xl font-bold text-[#432616]">
              {formatPrice(totalPrice)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={totalQuantity === 0}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#432616] px-6 text-sm font-semibold text-white transition hover:bg-[#2f1a0e] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {totalQuantity === 0
            ? "Select a ticket"
            : "Continue"}
        </button>
      </div>
    </div>
  );
}