"use client";

import {
  getEventDraft,
  saveEventDraft,
} from "@/lib/dashboard/eventDraft";

import {
  createOrder,
} from "@/lib/orders/order";

import {
  createTickets,
} from "@/lib/tickets/ticket";

export type PurchaseTicketInput = {
  eventId: string;

  ticketTypeId: string;

  buyerId: string;
  buyerName: string;
  buyerEmail: string;

  quantity: number;
};

export type PurchaseTicketResult = {
  orderId: string;

  ticketIds: string[];

  totalAmount: number;

  paymentRequired: boolean;
};

export function purchaseTicket(
  input: PurchaseTicketInput
): PurchaseTicketResult {
  const event =
    getEventDraft(
      input.eventId
    );

  if (!event) {
    throw new Error(
      "Event not found."
    );
  }

  if (
    event.status !==
    "published"
  ) {
    throw new Error(
      "This event is not available."
    );
  }

  if (
    input.quantity <= 0
  ) {
    throw new Error(
      "Quantity must be at least 1."
    );
  }

  const ticket =
    event.tickets.find(
      (item) =>
        item.id ===
        input.ticketTypeId
    );

  if (!ticket) {
    throw new Error(
      "Ticket type not found."
    );
  }

  const available =
    Math.max(
      ticket.quantity -
        ticket.sold,
      0
    );

  if (
    input.quantity >
    available
  ) {
    throw new Error(
      `Only ${available} ticket${
        available === 1
          ? ""
          : "s"
      } remaining.`
    );
  }

  const totalAmount =
    ticket.price *
    input.quantity;

  const isFree =
    totalAmount === 0;

  const order =
    createOrder({
      eventId:
        event.id,

      organizerId:
        event.organizerId,

      buyerId:
        input.buyerId,

      buyerName:
        input.buyerName,

      buyerEmail:
        input.buyerEmail,

      ticketTypeId:
        ticket.id,

      ticketName:
        ticket.name,

      quantity:
        input.quantity,

      unitPrice:
        ticket.price,

      totalAmount,

      status: isFree
        ? "free"
        : "pending",

      paidAt: null,
    });

  /*
   * FREE EVENT
   *
   * Generate tickets immediately.
   */
  if (isFree) {
    const tickets =
      createTickets(
        {
          orderId:
            order.id,

          eventId:
            event.id,

          organizerId:
            event.organizerId,

          buyerId:
            input.buyerId,

          buyerName:
            input.buyerName,

          buyerEmail:
            input.buyerEmail,

          ticketTypeId:
            ticket.id,

          ticketName:
            ticket.name,

          price:
            ticket.price,

          status: "valid",

          usedAt: null,
        },

        input.quantity
      );

    saveEventDraft({
      ...event,

      tickets:
        event.tickets.map(
          (item) =>
            item.id ===
            ticket.id
              ? {
                  ...item,
                  sold:
                    item.sold +
                    input.quantity,
                }
              : item
        ),
    });

    return {
      orderId:
        order.id,

      ticketIds:
        tickets.map(
          (item) =>
            item.id
        ),

      totalAmount,

      paymentRequired:
        false,
    };
  }

  /*
   * PAID EVENT
   *
   * Do NOT generate the ticket yet.
   * Payment must be completed first.
   */
  return {
    orderId:
      order.id,

    ticketIds: [],

    totalAmount,

    paymentRequired:
      true,
  };
}