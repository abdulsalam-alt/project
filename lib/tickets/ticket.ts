"use client";

export type TicketStatus =
  | "valid"
  | "used"
  | "cancelled";

export type Ticket = {
  id: string;

  orderId: string;

  eventId: string;
  organizerId: string;

  buyerId: string;
  buyerName: string;
  buyerEmail: string;

  ticketTypeId: string;
  ticketName: string;

  price: number;

  qrCode: string;

  status: TicketStatus;

  createdAt: string;
  usedAt: string | null;
};

const STORAGE_KEY =
  "teeket:tickets:v1";

let cachedTickets: Ticket[] | null =
  null;

type Listener = () => void;

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) =>
    listener()
  );
}

function createId(
  prefix: string
) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function readStorage(): Ticket[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function writeStorage(
  tickets: Ticket[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tickets)
  );
}

function ensureCache() {
  if (cachedTickets === null) {
    cachedTickets =
      readStorage();
  }

  return cachedTickets;
}

function refreshCache() {
  cachedTickets =
    readStorage();

  notify();
}

if (
  typeof window !==
  "undefined"
) {
  window.addEventListener(
    "storage",
    (event) => {
      if (
        event.key ===
        STORAGE_KEY
      ) {
        refreshCache();
      }
    }
  );
}

export function subscribeToTickets(
  listener: Listener
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getTickets(): Ticket[] {
  return ensureCache();
}

export function getTicket(
  id: string
): Ticket | null {
  return (
    ensureCache().find(
      (ticket) =>
        ticket.id === id
    ) ?? null
  );
}

export function getTicketsByBuyer(
  buyerId: string
): Ticket[] {
  return ensureCache().filter(
    (ticket) =>
      ticket.buyerId ===
      buyerId
  );
}

export function getTicketsByEvent(
  eventId: string
): Ticket[] {
  return ensureCache().filter(
    (ticket) =>
      ticket.eventId ===
      eventId
  );
}

export function getTicketsByOrganizer(
  organizerId: string
): Ticket[] {
  return ensureCache().filter(
    (ticket) =>
      ticket.organizerId ===
      organizerId
  );
}

export function createTickets(
  input: Omit<
    Ticket,
    "id" | "qrCode" | "createdAt"
  >,
  quantity: number
): Ticket[] {
  if (quantity <= 0) {
    return [];
  }

  const tickets: Ticket[] =
    Array.from(
      {
        length: quantity,
      },
      () => ({
        ...input,

        id: createId("TEE-TKT"),

        qrCode: createId(
          "TEE-QR"
        ),

        createdAt:
          new Date().toISOString(),
      })
    );

  cachedTickets = [
    ...ensureCache(),
    ...tickets,
  ];

  writeStorage(
    cachedTickets
  );

  notify();

  return tickets;
}

export function markTicketUsed(
  ticketId: string
): Ticket | null {
  const tickets =
    ensureCache();

  const index =
    tickets.findIndex(
      (ticket) =>
        ticket.id ===
        ticketId
    );

  if (index === -1) {
    return null;
  }

  if (
    tickets[index].status ===
    "used"
  ) {
    return tickets[index];
  }

  const updated: Ticket = {
    ...tickets[index],

    status: "used",

    usedAt:
      new Date().toISOString(),
  };

  tickets[index] =
    updated;

  cachedTickets = [
    ...tickets,
  ];

  writeStorage(
    cachedTickets
  );

  notify();

  return updated;
}