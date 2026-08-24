"use client";

/* =========================================================
   PAYOUT ACCOUNT
========================================================= */

export type OrganizerPayoutAccount = {
  organizerId: string;

  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;

  createdAt: string;
  updatedAt: string;
};

/* =========================================================
   TRANSACTIONS
========================================================= */

export type OrganizerTransactionType =
  | "ticket-sale"
  | "refund"
  | "payout";

export type OrganizerTransactionStatus =
  | "successful"
  | "pending"
  | "failed";

export type OrganizerTransaction = {
  id: string;
  organizerId: string;

  eventId: string;
  eventTitle: string;

  type: OrganizerTransactionType;
  status: OrganizerTransactionStatus;

  ticketName?: string;
  quantity?: number;

  amount: number;

  createdAt: string;
};

/* =========================================================
   TICKETS SOLD
========================================================= */

export type OrganizerTicketSale = {
  id: string;

  organizerId: string;

  eventId: string;
  eventTitle: string;

  ticketId: string;
  ticketName: string;

  quantity: number;
  amount: number;

  buyerName?: string;
  buyerEmail?: string;

  createdAt: string;
};

/* =========================================================
   PAYOUTS
========================================================= */

export type OrganizerPayoutStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed";

export type OrganizerPayout = {
  id: string;

  organizerId: string;

  amount: number;

  bankName: string;
  accountNumber: string;

  status: OrganizerPayoutStatus;

  createdAt: string;
  processedAt: string | null;
};

/* =========================================================
   STORAGE KEYS
========================================================= */

const ACCOUNT_STORAGE_KEY =
  "teeket:organizer-accounts:v2";

const TRANSACTION_STORAGE_KEY =
  "teeket:organizer-transactions:v1";

const TICKET_STORAGE_KEY =
  "teeket:organizer-ticket-sales:v1";

const PAYOUT_STORAGE_KEY =
  "teeket:organizer-payouts:v1";

const CURRENT_ORGANIZER_KEY =
  "teeket:current-organizer-id";

/* =========================================================
   LISTENERS
========================================================= */

type Listener = () => void;

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

/* =========================================================
   ID
========================================================= */

function createId(prefix: string) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

/* =========================================================
   CURRENT ORGANIZER
========================================================= */

/**
 * For now this uses a stored organizer ID.
 *
 * Later, when authentication is connected,
 * replace this implementation with the logged-in
 * user's ID from your authentication system.
 */
export function getCurrentOrganizerId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing =
    window.localStorage.getItem(
      CURRENT_ORGANIZER_KEY
    );

  if (existing) {
    return existing;
  }

  const newId = createId("organizer");

  window.localStorage.setItem(
    CURRENT_ORGANIZER_KEY,
    newId
  );

  return newId;
}

/**
 * Useful later when login/authentication is added.
 */
export function setCurrentOrganizerId(
  organizerId: string
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    CURRENT_ORGANIZER_KEY,
    organizerId
  );

  notify();
}

/* =========================================================
   GENERIC STORAGE HELPERS
========================================================= */

function readArray<T>(
  key: string
): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? (parsed as T[])
      : [];
  } catch {
    return [];
  }
}

function writeArray<T>(
  key: string,
  value: T[]
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.error(
      "TEEKET storage error:",
      error
    );
  }
}

/* =========================================================
   SUBSCRIBE
========================================================= */

export function subscribeToOrganizerAccounts(
  listener: Listener
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/* =========================================================
   PAYOUT ACCOUNT
========================================================= */

export function getOrganizerAccount(
  organizerId: string | null | undefined
): OrganizerPayoutAccount | null {
  if (!organizerId) {
    return null;
  }

  const accounts =
    readArray<OrganizerPayoutAccount>(
      ACCOUNT_STORAGE_KEY
    );

  return (
    accounts.find(
      (account) =>
        account.organizerId === organizerId
    ) ?? null
  );
}

export function saveOrganizerAccount(
  input: Omit<
    OrganizerPayoutAccount,
    "createdAt" | "updatedAt"
  >
): OrganizerPayoutAccount {
  const accounts =
    readArray<OrganizerPayoutAccount>(
      ACCOUNT_STORAGE_KEY
    );

  const existingIndex =
    accounts.findIndex(
      (account) =>
        account.organizerId ===
        input.organizerId
    );

  const existing =
    existingIndex >= 0
      ? accounts[existingIndex]
      : null;

  const now =
    new Date().toISOString();

  const account: OrganizerPayoutAccount = {
    ...input,

    createdAt:
      existing?.createdAt ?? now,

    updatedAt: now,
  };

  if (existingIndex >= 0) {
    accounts[existingIndex] = account;
  } else {
    accounts.push(account);
  }

  writeArray(
    ACCOUNT_STORAGE_KEY,
    accounts
  );

  notify();

  return account;
}

export function deleteOrganizerAccount(
  organizerId: string
) {
  const accounts =
    readArray<OrganizerPayoutAccount>(
      ACCOUNT_STORAGE_KEY
    );

  const next =
    accounts.filter(
      (account) =>
        account.organizerId !==
        organizerId
    );

  writeArray(
    ACCOUNT_STORAGE_KEY,
    next
  );

  notify();
}

/* =========================================================
   TRANSACTIONS
========================================================= */

export function getOrganizerTransactions(
  organizerId: string
): OrganizerTransaction[] {
  if (!organizerId) {
    return [];
  }

  return readArray<OrganizerTransaction>(
    TRANSACTION_STORAGE_KEY
  )
    .filter(
      (transaction) =>
        transaction.organizerId ===
        organizerId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

export function saveOrganizerTransaction(
  input: Omit<
    OrganizerTransaction,
    "id" | "createdAt"
  >
): OrganizerTransaction {
  const transactions =
    readArray<OrganizerTransaction>(
      TRANSACTION_STORAGE_KEY
    );

  const transaction: OrganizerTransaction = {
    ...input,

    id: createId("transaction"),

    createdAt:
      new Date().toISOString(),
  };

  transactions.unshift(transaction);

  writeArray(
    TRANSACTION_STORAGE_KEY,
    transactions
  );

  notify();

  return transaction;
}

/* =========================================================
   TICKETS SOLD
========================================================= */

export function getOrganizerTicketSales(
  organizerId: string
): OrganizerTicketSale[] {
  if (!organizerId) {
    return [];
  }

  return readArray<OrganizerTicketSale>(
    TICKET_STORAGE_KEY
  )
    .filter(
      (sale) =>
        sale.organizerId ===
        organizerId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

export function saveOrganizerTicketSale(
  input: Omit<
    OrganizerTicketSale,
    "id" | "createdAt"
  >
): OrganizerTicketSale {
  const sales =
    readArray<OrganizerTicketSale>(
      TICKET_STORAGE_KEY
    );

  const sale: OrganizerTicketSale = {
    ...input,

    id: createId("ticket-sale"),

    createdAt:
      new Date().toISOString(),
  };

  sales.unshift(sale);

  writeArray(
    TICKET_STORAGE_KEY,
    sales
  );

  notify();

  return sale;
}

/* =========================================================
   PAYOUTS
========================================================= */

export function getOrganizerPayouts(
  organizerId: string
): OrganizerPayout[] {
  if (!organizerId) {
    return [];
  }

  return readArray<OrganizerPayout>(
    PAYOUT_STORAGE_KEY
  )
    .filter(
      (payout) =>
        payout.organizerId ===
        organizerId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

export function saveOrganizerPayout(
  input: Omit<
    OrganizerPayout,
    "id" | "createdAt"
  >
): OrganizerPayout {
  const payouts =
    readArray<OrganizerPayout>(
      PAYOUT_STORAGE_KEY
    );

  const payout: OrganizerPayout = {
    ...input,

    id: createId("payout"),

    createdAt:
      new Date().toISOString(),
  };

  payouts.unshift(payout);

  writeArray(
    PAYOUT_STORAGE_KEY,
    payouts
  );

  notify();

  return payout;
}

/* =========================================================
   ACCOUNT NUMBER MASK
========================================================= */

export function maskAccountNumber(
  accountNumber: string
): string {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }

  return `•••• •••• ${accountNumber.slice(
    -4
  )}`;
}

/* =========================================================
   ACCOUNT SUMMARY
========================================================= */

export function getOrganizerAccountSummary(
  organizerId: string
) {
  const transactions =
    getOrganizerTransactions(
      organizerId
    );

  const ticketSales =
    getOrganizerTicketSales(
      organizerId
    );

  const payouts =
    getOrganizerPayouts(
      organizerId
    );

  const totalSales =
    transactions
      .filter(
        (transaction) =>
          transaction.type ===
            "ticket-sale" &&
          transaction.status ===
            "successful"
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );

  const totalRefunds =
    transactions
      .filter(
        (transaction) =>
          transaction.type ===
            "refund" &&
          transaction.status ===
            "successful"
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );

  const totalPaidOut =
    payouts
      .filter(
        (payout) =>
          payout.status === "paid"
      )
      .reduce(
        (total, payout) =>
          total + payout.amount,
        0
      );

  const totalTicketsSold =
    ticketSales.reduce(
      (total, sale) =>
        total + sale.quantity,
      0
    );

  const availableBalance =
    totalSales -
    totalRefunds -
    totalPaidOut;

  return {
    totalSales,
    totalRefunds,
    totalPaidOut,
    totalTicketsSold,
    availableBalance:
      Math.max(0, availableBalance),
  };
}