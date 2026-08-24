"use client";

export type OrderStatus =
  | "pending"
  | "paid"
  | "free"
  | "failed"
  | "cancelled";

export type Order = {
  id: string;

  eventId: string;
  organizerId: string;

  buyerId: string;
  buyerName: string;
  buyerEmail: string;

  ticketTypeId: string;
  ticketName: string;

  quantity: number;

  unitPrice: number;
  totalAmount: number;

  status: OrderStatus;

  createdAt: string;
  paidAt: string | null;
};

const STORAGE_KEY =
  "teeket:orders:v1";

let cachedOrders: Order[] | null =
  null;

type Listener = () => void;

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) =>
    listener()
  );
}

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `order-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function readStorage(): Order[] {
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
  orders: Order[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(orders)
  );
}

function ensureCache() {
  if (cachedOrders === null) {
    cachedOrders = readStorage();
  }

  return cachedOrders;
}

function refreshCache() {
  cachedOrders = readStorage();
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

export function subscribeToOrders(
  listener: Listener
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getOrders(): Order[] {
  return ensureCache();
}

export function getOrder(
  id: string
): Order | null {
  return (
    ensureCache().find(
      (order) =>
        order.id === id
    ) ?? null
  );
}

export function getOrdersByBuyer(
  buyerId: string
): Order[] {
  return ensureCache().filter(
    (order) =>
      order.buyerId ===
      buyerId
  );
}

export function getOrdersByOrganizer(
  organizerId: string
): Order[] {
  return ensureCache().filter(
    (order) =>
      order.organizerId ===
      organizerId
  );
}

export function createOrder(
  input: Omit<
    Order,
    "id" | "createdAt"
  >
): Order {
  const order: Order = {
    ...input,

    id: createId(),

    createdAt:
      new Date().toISOString(),
  };

  const orders =
    ensureCache();

  cachedOrders = [
    ...orders,
    order,
  ];

  writeStorage(
    cachedOrders
  );

  notify();

  return order;
}

export function markOrderPaid(
  orderId: string
): Order | null {
  const orders =
    ensureCache();

  const index =
    orders.findIndex(
      (order) =>
        order.id ===
        orderId
    );

  if (index === -1) {
    return null;
  }

  const updated: Order = {
    ...orders[index],

    status: "paid",

    paidAt:
      new Date().toISOString(),
  };

  orders[index] =
    updated;

  cachedOrders = [
    ...orders,
  ];

  writeStorage(
    cachedOrders
  );

  notify();

  return updated;
}

export function cancelOrder(
  orderId: string
): Order | null {
  const orders =
    ensureCache();

  const index =
    orders.findIndex(
      (order) =>
        order.id ===
        orderId
    );

  if (index === -1) {
    return null;
  }

  const updated: Order = {
    ...orders[index],

    status: "cancelled",
  };

  orders[index] =
    updated;

  cachedOrders = [
    ...orders,
  ];

  writeStorage(
    cachedOrders
  );

  notify();

  return updated;
}