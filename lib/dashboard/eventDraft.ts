"use client";

/* =========================================================
   IMPORTS
========================================================= */

import type {
  Event,
  EventCategory,
  EventOrganizer,
  EventStatus,
  EventTicket,
} from "@/lib/data/event";

/* =========================================================
   RE-EXPORT SHARED EVENT TYPES
========================================================= */

export type {
  EventCategory,
  EventStatus,
  EventOrganizer,
  EventTicket,
};

/* =========================================================
   TICKET TYPE
========================================================= */

export type TicketType =
  | "free"
  | "paid"
  | "mixed";

/* =========================================================
   DRAFT TICKET
========================================================= */

export type DraftTicket = {
  id: string;

  name: string;

  type?: "free" | "paid";

  price: number;

  quantity: number;

  sold: number;

  available: number;

  description: string;
};

/* =========================================================
   EVENT DRAFT STEP
========================================================= */

export type EventDraftStep =
  | "details"
  | "location"
  | "tickets"
  | "payment"
  | "review";

/* =========================================================
   EVENT DRAFT
========================================================= */

export type EventDraft = {
  id: string;

  slug?: string;

  title: string;

  description: string;

  category?: EventCategory;

  image?: string;

  organizerImage?: string;

  date?: string;

  /*
   * New time structure.
   */
  startTime?: string;

  endTime?: string;

  /*
   * Kept for backwards compatibility
   * with older components.
   */
  time?: string;

  location?: string;

  venue?: string;

  address?: string;

  latitude?: number;

  longitude?: number;

  /*
   * Ticket sales period.
   */
  ticketSalesStart?: string;

  ticketSalesEnd?: string;

  organizer?: EventOrganizer;

  tickets: DraftTicket[];

  ticketType?: TicketType;

  currentStep: EventDraftStep;

  status: EventStatus;

  createdAt: string;

  updatedAt: string;
};

/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE_KEY =
  "teeket-event-drafts";

const ORGANIZER_EVENTS_KEY =
  "teeket-organizer-events";

export {
  ORGANIZER_EVENTS_KEY,
};

/* =========================================================
   DEFAULT ORGANIZER
========================================================= */

const DEFAULT_ORGANIZER: EventOrganizer = {
  id: "default-organizer",

  name: "TEEKET Organizer",

  image:
    "/images/organizers/default.png",
};

/* =========================================================
   LISTENERS
========================================================= */

const listeners =
  new Set<() => void>();

/* =========================================================
   EMPTY SERVER SNAPSHOTS
========================================================= */

export const EMPTY_DRAFTS: EventDraft[] = [];

export const EMPTY_EVENTS: Event[] = [];

/* =========================================================
   CACHED SNAPSHOTS
========================================================= */

let cachedDrafts: EventDraft[] =
  EMPTY_DRAFTS;

let cachedOrganizerEvents: Event[] =
  EMPTY_EVENTS;

let cachedPublicEvents: Event[] =
  EMPTY_EVENTS;

let draftsCacheInitialized =
  false;

let organizerEventsCacheInitialized =
  false;

/* =========================================================
   STORAGE CHECK
========================================================= */

function canUseStorage(): boolean {
  return (
    typeof window !==
      "undefined" &&
    typeof window.localStorage !==
      "undefined"
  );
}

/* =========================================================
   GENERATE ID
========================================================= */

function generateId(): string {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/* =========================================================
   CURRENT TIME
========================================================= */

function now(): string {
  return new Date().toISOString();
}

/* =========================================================
   CREATE SLUG
========================================================= */

function createSlug(
  value: string
): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) ||
    `event-${Date.now()}`
  );
}

/* =========================================================
   EVENT STATUS VALIDATION
========================================================= */

function isEventStatus(
  value: unknown
): value is EventStatus {
  return (
    value === "draft" ||
    value === "pending-review" ||
    value === "published" ||
    value === "rejected" ||
    value === "ended" ||
    value === "cancelled"
  );
}

/* =========================================================
   EVENT CATEGORY VALIDATION
========================================================= */

function isEventCategory(
  value: unknown
): value is EventCategory {
  return (
    value === "community" ||
    value === "art-culture" ||
    value === "sport-wellness" ||
    value === "career-business" ||
    value === "concerts" ||
    value === "food-drinks" ||
    value === "spirituality-religion" ||
    value === "night-life"
  );
}

/* =========================================================
   TICKET TYPE VALIDATION
========================================================= */

function isTicketType(
  value: unknown
): value is TicketType {
  return (
    value === "free" ||
    value === "paid" ||
    value === "mixed"
  );
}

/* =========================================================
   DRAFT STEP VALIDATION
========================================================= */

function isEventDraftStep(
  value: unknown
): value is EventDraftStep {
  return (
    value === "details" ||
    value === "location" ||
    value === "tickets" ||
    value === "payment" ||
    value === "review"
  );
}

/* =========================================================
   NORMALIZE TICKET
========================================================= */

function normalizeTicket(
  value: unknown
): DraftTicket | null {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return null;
  }

  const ticket =
    value as Partial<DraftTicket>;

  const id =
    typeof ticket.id ===
    "string"
      ? ticket.id
      : generateId();

  const name =
    typeof ticket.name ===
      "string" &&
    ticket.name.trim()
      ? ticket.name
      : "General Admission";

  const price =
    typeof ticket.price ===
      "number" &&
    Number.isFinite(
      ticket.price
    )
      ? Math.max(
          0,
          ticket.price
        )
      : 0;

  const quantity =
    typeof ticket.quantity ===
      "number" &&
    Number.isFinite(
      ticket.quantity
    )
      ? ticket.quantity
      : 100;

  const sold =
    typeof ticket.sold ===
      "number" &&
    Number.isFinite(
      ticket.sold
    )
      ? Math.max(
          0,
          ticket.sold
        )
      : 0;

  const available =
    typeof ticket.available ===
      "number" &&
    Number.isFinite(
      ticket.available
    )
      ? ticket.available
      : quantity === -1
      ? -1
      : Math.max(
          0,
          quantity - sold
        );

  const description =
    typeof ticket.description ===
      "string"
      ? ticket.description
      : "";

  const type =
    ticket.type === "free"
      ? "free"
      : ticket.type === "paid"
      ? "paid"
      : price === 0
      ? "free"
      : "paid";

  return {
    id,
    name,
    type,
    price,
    quantity,
    sold,
    available,
    description,
  };
}

/* =========================================================
   NORMALIZE DRAFT
========================================================= */

function normalizeDraft(
  input: EventDraft
): EventDraft {
  const title =
    typeof input.title ===
    "string"
      ? input.title
      : "";

  const description =
    typeof input.description ===
    "string"
      ? input.description
      : "";

  const slug =
    typeof input.slug ===
      "string" &&
    input.slug.trim()
      ? input.slug
      : createSlug(
          title || input.id
        );

  return {
    id: input.id,

    slug,

    title,

    description,

    category:
      isEventCategory(
        input.category
      )
        ? input.category
        : undefined,

    image:
      input.image || undefined,

    organizerImage:
      input.organizerImage ||
      undefined,

    date:
      input.date || undefined,

    startTime:
      input.startTime ||
      undefined,

    endTime:
      input.endTime ||
      undefined,

    time:
      input.time || undefined,

    location:
      input.location ||
      undefined,

    venue:
      input.venue || undefined,

    address:
      input.address ||
      undefined,

    latitude:
      typeof input.latitude ===
      "number"
        ? input.latitude
        : undefined,

    longitude:
      typeof input.longitude ===
      "number"
        ? input.longitude
        : undefined,

    ticketSalesStart:
      input.ticketSalesStart ||
      undefined,

    ticketSalesEnd:
      input.ticketSalesEnd ||
      undefined,

    organizer:
      input.organizer ??
      DEFAULT_ORGANIZER,

    tickets:
      Array.isArray(
        input.tickets
      )
        ? input.tickets
            .map(
              normalizeTicket
            )
            .filter(
              (
                ticket
              ): ticket is DraftTicket =>
                ticket !== null
            )
        : [],

    ticketType:
      isTicketType(
        input.ticketType
      )
        ? input.ticketType
        : undefined,

    currentStep:
      isEventDraftStep(
        input.currentStep
      )
        ? input.currentStep
        : "details",

    status:
      isEventStatus(
        input.status
      )
        ? input.status
        : "draft",

    createdAt:
      input.createdAt ||
      now(),

    updatedAt:
      input.updatedAt ||
      now(),
  };
}

/* =========================================================
   READ DRAFTS FROM STORAGE
========================================================= */

function readDraftsFromStorage(): EventDraft[] {
  if (!canUseStorage()) {
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

    const parsed: unknown =
      JSON.parse(raw);

    if (
      !Array.isArray(parsed)
    ) {
      return [];
    }

    return parsed
      .map((item) => {
        if (
          typeof item !==
            "object" ||
          item === null
        ) {
          return null;
        }

        const value =
          item as Record<
            string,
            unknown
          >;

        if (
          typeof value.id !==
            "string" ||
          typeof value.title !==
            "string"
        ) {
          return null;
        }

        const tickets =
          Array.isArray(
            value.tickets
          )
            ? value.tickets
            : [];

        return normalizeDraft({
          id: value.id,

          slug:
            typeof value.slug ===
            "string"
              ? value.slug
              : undefined,

          title:
            value.title,

          description:
            typeof value.description ===
            "string"
              ? value.description
              : "",

          category:
            isEventCategory(
              value.category
            )
              ? value.category
              : undefined,

          image:
            typeof value.image ===
            "string"
              ? value.image
              : undefined,

          organizerImage:
            typeof value.organizerImage ===
            "string"
              ? value.organizerImage
              : undefined,

          date:
            typeof value.date ===
            "string"
              ? value.date
              : undefined,

          startTime:
            typeof value.startTime ===
            "string"
              ? value.startTime
              : undefined,

          endTime:
            typeof value.endTime ===
            "string"
              ? value.endTime
              : undefined,

          time:
            typeof value.time ===
            "string"
              ? value.time
              : undefined,

          location:
            typeof value.location ===
            "string"
              ? value.location
              : undefined,

          venue:
            typeof value.venue ===
            "string"
              ? value.venue
              : undefined,

          address:
            typeof value.address ===
            "string"
              ? value.address
              : undefined,

          latitude:
            typeof value.latitude ===
            "number"
              ? value.latitude
              : undefined,

          longitude:
            typeof value.longitude ===
            "number"
              ? value.longitude
              : undefined,

          ticketSalesStart:
            typeof value.ticketSalesStart ===
            "string"
              ? value.ticketSalesStart
              : undefined,

          ticketSalesEnd:
            typeof value.ticketSalesEnd ===
            "string"
              ? value.ticketSalesEnd
              : undefined,

          organizer:
            typeof value.organizer ===
            "object" &&
            value.organizer !== null
              ? (value.organizer as EventOrganizer)
              : undefined,

          tickets,

          ticketType:
            isTicketType(
              value.ticketType
            )
              ? value.ticketType
              : undefined,

          currentStep:
            isEventDraftStep(
              value.currentStep
            )
              ? value.currentStep
              : "details",

          status:
            isEventStatus(
              value.status
            )
              ? value.status
              : "draft",

          createdAt:
            typeof value.createdAt ===
            "string"
              ? value.createdAt
              : now(),

          updatedAt:
            typeof value.updatedAt ===
            "string"
              ? value.updatedAt
              : now(),
        });
      })
      .filter(
        (
          draft
        ): draft is EventDraft =>
          draft !== null
      );
  } catch (error) {
    console.error(
      "TEEKET: Failed to read event drafts.",
      error
    );

    return [];
  }
}

/* =========================================================
   REFRESH DRAFT CACHE
========================================================= */

function refreshDraftCache(): void {
  cachedDrafts =
    readDraftsFromStorage();

  draftsCacheInitialized =
    true;
}

/* =========================================================
   GET DRAFT SNAPSHOT
========================================================= */

export function getDraftSnapshot(): EventDraft[] {
  if (
    !draftsCacheInitialized
  ) {
    refreshDraftCache();
  }

  return cachedDrafts;
}

/* =========================================================
   WRITE DRAFTS
========================================================= */

function writeDrafts(
  drafts: EventDraft[]
): void {
  const normalized =
    drafts.map(
      normalizeDraft
    );

  cachedDrafts =
    normalized;

  draftsCacheInitialized =
    true;

  /*
   * Rebuild organizer events BEFORE
   * notifying subscribers.
   */
  refreshOrganizerEventsCache();

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          normalized
        )
      );
    } catch (error) {
      /*
       * If localStorage quota has been
       * exceeded, remove the existing
       * draft storage and try saving again.
       */
      if (
        error instanceof DOMException &&
        (
          error.name ===
            "QuotaExceededError" ||
          error.code === 22
        )
      ) {
        try {
          window.localStorage.removeItem(
            STORAGE_KEY
          );

          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
              normalized
            )
          );
        } catch (retryError) {
          console.error(
            "TEEKET: Failed to save event drafts after clearing storage.",
            retryError
          );

          throw new Error(
            "Unable to save event draft because browser storage is full."
          );
        }
      } else {
        console.error(
          "TEEKET: Failed to save event drafts.",
          error
        );

        throw new Error(
          "Unable to save event draft."
        );
      }
    }
  }

  notifyListeners();
}

/* =========================================================
   NOTIFY LISTENERS
========================================================= */

function notifyListeners(): void {
  listeners.forEach(
    (listener) => {
      try {
        listener();
      } catch (error) {
        console.error(
          "TEEKET: Draft listener error.",
          error
        );
      }
    }
  );
}

/* =========================================================
   SUBSCRIBE
========================================================= */

export function subscribeToEventDrafts(
  callback: () => void
): () => void {
  listeners.add(
    callback
  );

  return () => {
    listeners.delete(
      callback
    );
  };
}

/* =========================================================
   CREATE INPUT
========================================================= */

export type CreateEventDraftInput =
  Partial<
    Omit<
      EventDraft,
      | "id"
      | "createdAt"
      | "updatedAt"
    >
  >;

/* =========================================================
   CREATE EVENT DRAFT
========================================================= */

export function createEventDraft(
  input: CreateEventDraftInput = {}
): EventDraft {
  const timestamp =
    now();

  const draft =
    normalizeDraft({
      id: generateId(),

      slug:
        input.slug ||
        createSlug(
          input.title ||
            "Untitled Event"
        ),

      title:
        input.title || "",

      description:
        input.description || "",

      category:
        input.category,

      image:
        input.image,

      organizerImage:
        input.organizerImage,

      date:
        input.date,

      startTime:
        input.startTime,

      endTime:
        input.endTime,

      time:
        input.time,

      location:
        input.location,

      venue:
        input.venue,

      address:
        input.address,

      latitude:
        input.latitude,

      longitude:
        input.longitude,

      ticketSalesStart:
        input.ticketSalesStart,

      ticketSalesEnd:
        input.ticketSalesEnd,

      organizer:
        input.organizer ??
        DEFAULT_ORGANIZER,

      tickets:
        input.tickets ?? [],

      ticketType:
        input.ticketType,

      currentStep:
        input.currentStep ??
        "details",

      status:
        input.status ??
        "draft",

      createdAt:
        timestamp,

      updatedAt:
        timestamp,
    });

  const drafts =
    getDraftSnapshot();

  writeDrafts([
    ...drafts,
    draft,
  ]);

  return draft;
}

/* =========================================================
   GET EVENT DRAFT
========================================================= */

export function getEventDraft(
  id: string
): EventDraft | null {
  if (!id) {
    return null;
  }

  const draft =
    getDraftSnapshot().find(
      (item) =>
        item.id === id
    );

  return draft
    ? normalizeDraft(draft)
    : null;
}

/* =========================================================
   GET ALL DRAFTS
========================================================= */

export function getEventDrafts(): EventDraft[] {
  return getDraftSnapshot();
}

/* =========================================================
   SAVE EVENT INPUT
========================================================= */

export type SaveEventDraftInput =
  Partial<
    Omit<
      EventDraft,
      | "createdAt"
      | "updatedAt"
      | "ticketType"
    >
  > & {
    id: string;

    ticketType?:
      | TicketType
      | "";
  };

/* =========================================================
   SAVE EVENT DRAFT
========================================================= */

export function saveEventDraft(
  input: SaveEventDraftInput
): EventDraft {
  if (!input.id) {
    throw new Error(
      "Event draft ID is required."
    );
  }

  const drafts =
    getDraftSnapshot();

  const index =
    drafts.findIndex(
      (draft) =>
        draft.id === input.id
    );

  if (index === -1) {
    throw new Error(
      "Event draft could not be found."
    );
  }

  const existing =
    normalizeDraft(
      drafts[index]
    );

  const nextTicketType:
    | TicketType
    | undefined =
    input.ticketType === ""
      ? undefined
      : input.ticketType ??
        existing.ticketType;

  const {
    ticketType: _ticketType,
    ...restInput
  } = input;

  const updated: EventDraft =
    normalizeDraft({
      ...existing,

      ...restInput,

      id:
        existing.id,

      createdAt:
        existing.createdAt,

      updatedAt:
        now(),

      ticketType:
        nextTicketType,

      tickets:
        input.tickets ??
        existing.tickets,

      currentStep:
        input.currentStep ??
        existing.currentStep,

      status:
        input.status ??
        existing.status,
    });

  const nextDrafts =
    [...drafts];

  nextDrafts[index] =
    updated;

  writeDrafts(
    nextDrafts
  );

  return updated;
}

/* =========================================================
   DELETE EVENT DRAFT
========================================================= */

export function deleteEventDraft(
  id: string
): void {
  if (!id) {
    return;
  }

  const drafts =
    getDraftSnapshot();

  writeDrafts(
    drafts.filter(
      (draft) =>
        draft.id !== id
    )
  );
}

/* =========================================================
   CLEAR ALL DRAFTS
========================================================= */

export function clearEventDrafts(): void {
  writeDrafts([]);
}

/* =========================================================
   CONVERT DRAFT TICKET
========================================================= */

function convertDraftTicket(
  ticket: DraftTicket
): EventTicket {
  return {
    id: ticket.id,

    name:
      ticket.name ||
      "General Admission",

    price:
      Math.max(
        0,
        Number(ticket.price) || 0
      ),

    quantity:
      ticket.quantity,

    sold:
      Math.max(
        0,
        Number(ticket.sold) || 0
      ),

    description:
      ticket.description || "",
  };
}

/* =========================================================
   CONVERT DRAFT TO EVENT
========================================================= */

export function convertDraftToEvent(
  draft: EventDraft
): Event {
  const normalized =
    normalizeDraft(
      draft
    );

  if (!normalized.category) {
    throw new Error(
      "Event category is required."
    );
  }

  if (!normalized.date) {
    throw new Error(
      "Event date is required."
    );
  }

  /*
   * Support both the new
   * start/end time structure
   * and the old time field.
   */
  const eventTime =
    normalized.startTime ||
    normalized.time;

  if (!eventTime) {
    throw new Error(
      "Event start time is required."
    );
  }

  if (!normalized.location) {
    throw new Error(
      "Event location is required."
    );
  }

  if (
    typeof normalized.latitude !==
      "number" ||
    typeof normalized.longitude !==
      "number"
  ) {
    throw new Error(
      "Event coordinates are required."
    );
  }

  const slug =
    normalized.slug ||
    createSlug(
      normalized.title
    );

  const event: Event = {
    id:
      normalized.id,

    slug,

    title:
      normalized.title,

    description:
      normalized.description,

    image:
      normalized.image,

    organizerImage:
      normalized.organizerImage,

    category:
      normalized.category,

    date:
      normalized.date,

    time:
      eventTime,

    location:
      normalized.location,

    venue:
      normalized.venue,

    address:
      normalized.address,

    latitude:
      normalized.latitude,

    longitude:
      normalized.longitude,

    organizer:
      normalized.organizer ??
      DEFAULT_ORGANIZER,

    tickets:
      normalized.tickets.map(
        convertDraftTicket
      ),

    status:
      normalized.status,

    createdAt:
      normalized.createdAt,

    updatedAt:
      normalized.updatedAt,
  };

  return event;
}

/* =========================================================
   BUILD ORGANIZER EVENTS
========================================================= */

function buildOrganizerEvents(): Event[] {
  const drafts =
    getDraftSnapshot();

  return drafts
    .filter(
      (draft) =>
        draft.status ===
          "published" ||
        draft.status ===
          "pending-review" ||
        draft.status ===
          "ended" ||
        draft.status ===
          "cancelled"
    )
    .map((draft) => {
      try {
        return convertDraftToEvent(
          draft
        );
      } catch {
        return null;
      }
    })
    .filter(
      (
        event
      ): event is Event =>
        event !== null
    );
}

/* =========================================================
   REFRESH ORGANIZER EVENTS
========================================================= */

function refreshOrganizerEventsCache(): void {
  cachedOrganizerEvents =
    buildOrganizerEvents();

  /*
   * IMPORTANT:
   * Keep public events cached as well.
   *
   * Do NOT call .filter() inside
   * getPublicEvents(), because that
   * creates a new array on every
   * getSnapshot() call.
   */
  cachedPublicEvents =
    cachedOrganizerEvents.filter(
      (event) =>
        event.status ===
        "published"
    );

  organizerEventsCacheInitialized =
    true;
}

/* =========================================================
   GET ORGANIZER EVENTS
========================================================= */

export function getOrganizerEvents(): Event[] {
  if (
    !organizerEventsCacheInitialized
  ) {
    refreshOrganizerEventsCache();
  }

  return cachedOrganizerEvents;
}

/* =========================================================
   GET PUBLIC EVENTS
========================================================= */

/**
 * Returns only events that have been approved
 * and published.
 *
 * Used by the public Discover Events page.
 *
 * IMPORTANT:
 * This function MUST return the cached
 * array reference. Do not use .filter()
 * directly here.
 */
export function getPublicEvents(): Event[] {
  if (
    !organizerEventsCacheInitialized
  ) {
    refreshOrganizerEventsCache();
  }

  return cachedPublicEvents;
}

/* =========================================================
   DELETE ORGANIZER EVENT
========================================================= */

export function deleteOrganizerEvent(
  eventId: string
): boolean {
  if (!eventId) {
    return false;
  }

  const drafts =
    getDraftSnapshot();

  const exists =
    drafts.some(
      (draft) =>
        draft.id === eventId
    );

  if (!exists) {
    return false;
  }

  writeDrafts(
    drafts.filter(
      (draft) =>
        draft.id !== eventId
    )
  );

  return true;
}

/* =========================================================
   UPDATE ORGANIZER EVENT STATUS
========================================================= */

export function updateOrganizerEventStatus(
  eventId: string,
  status: EventStatus
): Event | null {
  if (!eventId) {
    return null;
  }

  if (!isEventStatus(status)) {
    return null;
  }

  const drafts =
    getDraftSnapshot();

  const index =
    drafts.findIndex(
      (draft) =>
        draft.id === eventId
    );

  if (index === -1) {
    return null;
  }

  const updated =
    normalizeDraft({
      ...drafts[index],

      status,

      updatedAt:
        now(),
    });

  const nextDrafts =
    [...drafts];

  nextDrafts[index] =
    updated;

  writeDrafts(
    nextDrafts
  );

  try {
    return convertDraftToEvent(
      updated
    );
  } catch {
    return null;
  }
}

/* =========================================================
   PUBLISH EVENT
========================================================= */

export function publishEventDraft(
  eventId: string
): Event | null {
  return updateOrganizerEventStatus(
    eventId,
    "published"
  );
}

/* =========================================================
   SUBMIT EVENT FOR REVIEW
========================================================= */

export function submitEventForReview(
  eventId: string
): EventDraft {
  const draft =
    getEventDraft(
      eventId
    );

  if (!draft) {
    throw new Error(
      "Event draft could not be found."
    );
  }

  return saveEventDraft({
    id: eventId,

    status:
      "pending-review",

    currentStep:
      "review",
  });
}

/* =========================================================
   INITIAL CLIENT CACHE
========================================================= */

if (canUseStorage()) {
  refreshDraftCache();

  refreshOrganizerEventsCache();
}

/* =========================================================
   APPROVE ORGANIZER EVENT
========================================================= */

export function approveOrganizerEvent(
  eventId: string
): Event | null {
  if (!eventId) {
    return null;
  }

  return updateOrganizerEventStatus(
    eventId,
    "published"
  );
}

/* =========================================================
   REJECT ORGANIZER EVENT
========================================================= */

export function rejectOrganizerEvent(
  eventId: string
): Event | null {
  if (!eventId) {
    return null;
  }

  return updateOrganizerEventStatus(
    eventId,
    "rejected"
  );
}