"use client";

import type {
  Event,
  EventCategory,
  EventStatus,
} from "@/lib/data/event";

export type {
  EventCategory,
  EventStatus,
};

/* =========================================================
   TICKET
========================================================= */

export interface EventTicket {
  id: string;
  name: string;
  price: number;

  /*
   * Main quantity field used by the Event type.
   */
  quantity: number;

  /*
   * Optional alias used by some ticket pages.
   * It is always kept synchronized with quantity.
   */
  available?: number;

  sold?: number;

  description?: string;
}

/*
 * Some of your existing pages import DraftTicket.
 *
 * Keep this alias so those pages do not break.
 */
export type DraftTicket = EventTicket;

/* =========================================================
   EVENT DRAFT
========================================================= */

export interface EventDraft {
  id: string;

  slug: string;

  title: string;

  description: string;

  image?: string;

  organizerImage?: string;

  category: EventCategory;

  date: string;

  time: string;

  startTime?: string;

  endTime?: string;

  location: string;

  venue?: string;

  address?: string;

  latitude?: number;

  longitude?: number;

  organizer: {
    id: string;
    name: string;
    image?: string;
  };

  organizerId?: string;

  organizerEmail?: string;

  tickets: EventTicket[];

  ticketType?: "free" | "paid";

  ticketSalesStart?: string;

  ticketSalesEnd?: string;

  status: EventStatus;

  rejectionReason?: string;

  currentStep?:
    | "details"
    | "location"
    | "tickets"
    | "payment"
    | "review"
    | "complete";

  createdAt: string;

  updatedAt: string;

  submittedAt?: string;

  publishedAt?: string;

  endedAt?: string;

  cancelledAt?: string;
}

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "teeket:event-drafts";

const CHANGE_EVENT = "teeket:event-drafts:changed";

/*
 * localStorage is small.
 *
 * We deliberately keep data URLs reasonably small.
 */
const MAX_IMAGE_LENGTH = 350_000;

const MAX_TOTAL_STORAGE_LENGTH = 4_000_000;

/* =========================================================
   CACHE
========================================================= */

let cachedEvents: EventDraft[] | null = null;

let cachedOrganizerEvents: EventDraft[] = [];

let cachedPublishedEvents: EventDraft[] = [];

let initialized = false;

/*
 * IMPORTANT:
 *
 * These references must stay stable when nothing changes.
 *
 * This prevents:
 *
 * "The result of getSnapshot should be cached..."
 */
const EMPTY_EVENTS: EventDraft[] = [];

/* =========================================================
   BROWSER
========================================================= */

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/* =========================================================
   ID
========================================================= */

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

/* =========================================================
   TIME
========================================================= */

function currentTime(): string {
  return new Date().toISOString();
}

/* =========================================================
   SLUG
========================================================= */

function createSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || `event-${Date.now()}`;
}

/* =========================================================
   IMAGE
========================================================= */

function sanitizeImage(
  image?: string
): string | undefined {
  if (!image) {
    return undefined;
  }

  /*
   * Normal paths and URLs are fine.
   */
  if (!image.startsWith("data:")) {
    return image;
  }

  /*
   * Prevent one giant base64 image from filling storage.
   */
  if (image.length > MAX_IMAGE_LENGTH) {
    return undefined;
  }

  return image;
}

/* =========================================================
   TICKET
========================================================= */

function sanitizeTicket(
  ticket?: Partial<EventTicket> | null
): EventTicket {
  const rawQuantity = Number(
    ticket?.quantity
  );

  const rawAvailable = Number(
    ticket?.available
  );

  let quantity = 0;

  if (
    Number.isFinite(rawQuantity) &&
    rawQuantity >= 0
  ) {
    quantity = Math.floor(rawQuantity);
  } else if (
    Number.isFinite(rawAvailable) &&
    rawAvailable >= 0
  ) {
    quantity = Math.floor(rawAvailable);
  }

  const rawSold = Number(ticket?.sold);

  const sold =
    Number.isFinite(rawSold) &&
    rawSold >= 0
      ? Math.floor(rawSold)
      : 0;

  return {
    id:
      ticket?.id ||
      createId(),

    name:
      typeof ticket?.name === "string"
        ? ticket.name
        : "",

    price:
      Number.isFinite(
        Number(ticket?.price)
      )
        ? Number(ticket?.price)
        : 0,

    quantity,

    available: quantity,

    sold,

    description:
      typeof ticket?.description === "string"
        ? ticket.description
        : "",
  };
}

/* =========================================================
   TICKETS
========================================================= */

function sanitizeTickets(
  tickets?: EventTicket[]
): EventTicket[] {
  if (!Array.isArray(tickets)) {
    return [];
  }

  return tickets.map(
    (ticket) =>
      sanitizeTicket(ticket)
  );
}

/* =========================================================
   ORGANIZER
========================================================= */

function sanitizeOrganizer(
  organizer:
    | EventDraft["organizer"]
    | string
    | undefined
    | null,

  organizerId?: string,

  organizerImage?: string
): EventDraft["organizer"] {
  /*
   * Object organizer.
   */
  if (
    organizer &&
    typeof organizer === "object"
  ) {
    return {
      id:
        organizer.id ||
        organizerId ||
        "organizer",

      name:
        organizer.name ||
        "Organizer",

      image:
        sanitizeImage(
          organizer.image
        ) ||
        sanitizeImage(
          organizerImage
        ),
    };
  }

  /*
   * String organizer.
   *
   * This protects older drafts.
   */
  if (
    typeof organizer === "string" &&
    organizer.trim()
  ) {
    return {
      id:
        organizerId ||
        "organizer",

      name:
        organizer.trim(),

      image:
        sanitizeImage(
          organizerImage
        ),
    };
  }

  /*
   * Missing organizer.
   */
  return {
    id:
      organizerId ||
      "organizer",

    name: "Organizer",

    image:
      sanitizeImage(
        organizerImage
      ),
  };
}

/* =========================================================
   SANITIZE EVENT
========================================================= */

function sanitizeEvent(
  event: Partial<EventDraft>
): EventDraft {
  const timestamp =
    currentTime();

  const id =
    event.id ||
    createId();

  const title =
    typeof event.title === "string"
      ? event.title
      : "";

  const organizer =
    sanitizeOrganizer(
      event.organizer,
      event.organizerId,
      event.organizerImage
    );

  return {
    id,

    slug:
      event.slug ||
      createSlug(
        title ||
          "untitled-event"
      ),

    title,

    description:
      typeof event.description ===
      "string"
        ? event.description
        : "",

    image:
      sanitizeImage(
        event.image
      ),

    organizerImage:
      sanitizeImage(
        event.organizerImage
      ),

    category:
      event.category ||
      "community",

    date:
      typeof event.date ===
      "string"
        ? event.date
        : "",

    time:
      typeof event.time ===
      "string"
        ? event.time
        : "",

    startTime:
      event.startTime,

    endTime:
      event.endTime,

    location:
      typeof event.location ===
      "string"
        ? event.location
        : "",

    venue:
      event.venue,

    address:
      event.address,

    latitude:
      typeof event.latitude ===
      "number"
        ? event.latitude
        : undefined,

    longitude:
      typeof event.longitude ===
      "number"
        ? event.longitude
        : undefined,

    organizer,

    organizerId:
      event.organizerId ||
      organizer.id,

    organizerEmail:
      event.organizerEmail,

    tickets:
      sanitizeTickets(
        event.tickets
      ),

    ticketType:
      event.ticketType,

    ticketSalesStart:
      event.ticketSalesStart,

    ticketSalesEnd:
      event.ticketSalesEnd,

    status:
      event.status ||
      "draft",

    rejectionReason:
      event.rejectionReason,

    currentStep:
      event.currentStep,

    createdAt:
      event.createdAt ||
      timestamp,

    updatedAt:
      timestamp,

    submittedAt:
      event.submittedAt,

    publishedAt:
      event.publishedAt,

    endedAt:
      event.endedAt,

    cancelledAt:
      event.cancelledAt,
  };
}

/* =========================================================
   READ STORAGE
========================================================= */

function readStorage(): EventDraft[] {
  if (!isBrowser()) {
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

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) =>
      sanitizeEvent(
        item as Partial<EventDraft>
      )
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
   SNAPSHOTS
========================================================= */

function rebuildSnapshots(): void {
  const events =
    cachedEvents || EMPTY_EVENTS;

  /*
   * Keep exact reference for organizer snapshot.
   */
  cachedOrganizerEvents =
    events;

  /*
   * Create a new published snapshot only when
   * the store itself changes.
   */
  cachedPublishedEvents =
    events.filter(
      (event) =>
        event.status ===
        "published"
    );
}

/* =========================================================
   INITIALIZE
========================================================= */

function initialize(): void {
  if (initialized) {
    return;
  }

  cachedEvents =
    readStorage();

  initialized = true;

  rebuildSnapshots();
}

/* =========================================================
   STORAGE REDUCTION
========================================================= */

function removeLargeImages(
  events: EventDraft[]
): EventDraft[] {
  return events.map(
    (event) => ({
      ...event,

      image:
        event.image?.startsWith(
          "data:"
        )
          ? undefined
          : event.image,

      organizerImage:
        event.organizerImage?.startsWith(
          "data:"
        )
          ? undefined
          : event.organizerImage,
    })
  );
}

/* =========================================================
   WRITE STORAGE
========================================================= */

function writeStorage(
  events: EventDraft[]
): boolean {
  if (!isBrowser()) {
    return false;
  }

  const cleanEvents =
    events.map(sanitizeEvent);

  /*
   * First attempt.
   */
  try {
    const serialized =
      JSON.stringify(
        cleanEvents
      );

    if (
      serialized.length <=
      MAX_TOTAL_STORAGE_LENGTH
    ) {
      window.localStorage.setItem(
        STORAGE_KEY,
        serialized
      );

      return true;
    }
  } catch {
    /*
     * Continue to reduced storage.
     */
  }

  /*
   * Second attempt:
   * remove base64 images.
   */
  try {
    const reduced =
      removeLargeImages(
        cleanEvents
      );

    const serialized =
      JSON.stringify(
        reduced
      );

    if (
      serialized.length <=
      MAX_TOTAL_STORAGE_LENGTH
    ) {
      window.localStorage.setItem(
        STORAGE_KEY,
        serialized
      );

      return true;
    }
  } catch {
    /*
     * Continue.
     */
  }

  /*
   * Third attempt:
   * keep the newest events that fit.
   */
  try {
    const reduced =
      removeLargeImages(
        cleanEvents
      );

    const selected: EventDraft[] =
      [];

    /*
     * Start from newest.
     */
    for (
      let index =
        reduced.length - 1;
      index >= 0;
      index--
    ) {
      const candidate = [
        reduced[index],
        ...selected,
      ];

      const serialized =
        JSON.stringify(
          candidate
        );

      if (
        serialized.length <=
        MAX_TOTAL_STORAGE_LENGTH
      ) {
        selected.unshift(
          reduced[index]
        );
      } else {
        break;
      }
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        selected
      )
    );

    return true;
  } catch (error) {
    console.error(
      "TEEKET: Unable to save event drafts to localStorage.",
      error
    );

    return false;
  }
}

/* =========================================================
   NOTIFY
========================================================= */

function notify(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new Event(
      CHANGE_EVENT
    )
  );
}

/* =========================================================
   UPDATE STORE
========================================================= */

function updateStore(
  events: EventDraft[]
): void {
  const cleanEvents =
    events.map(
      sanitizeEvent
    );

  cachedEvents =
    cleanEvents;

  initialized = true;

  rebuildSnapshots();

  writeStorage(
    cleanEvents
  );

  notify();
}

/* =========================================================
   GET ALL
========================================================= */

export function getAllEventDrafts(): EventDraft[] {
  initialize();

  return (
    cachedEvents ||
    EMPTY_EVENTS
  );
}

/* =========================================================
   GET SINGLE
========================================================= */

export function getEventDraft(
  id: string
): EventDraft | null {
  if (!id) {
    return null;
  }

  return (
    getAllEventDrafts().find(
      (event) =>
        event.id === id
    ) || null
  );
}

/* =========================================================
   ORGANIZER EVENTS
========================================================= */

export function getOrganizerEvents(): EventDraft[] {
  initialize();

  return cachedOrganizerEvents;
}

/*
 * Keep this export because your organizer dashboard
 * imports this exact function.
 */
export function getCurrentOrganizerEvents(): EventDraft[] {
  return getOrganizerEvents();
}

/* =========================================================
   SERVER SNAPSHOT
========================================================= */

export function getServerEvents(): EventDraft[] {
  return EMPTY_EVENTS;
}

/* =========================================================
   PUBLISHED DRAFTS
========================================================= */

export function getPublishedEventDrafts(): EventDraft[] {
  initialize();

  return cachedPublishedEvents;
}

/* =========================================================
   SUBSCRIBE
========================================================= */

export function subscribeToEventDrafts(
  callback: () => void
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const handleChange = () => {
    initialized = false;

    initialize();

    callback();
  };

  window.addEventListener(
    CHANGE_EVENT,
    handleChange
  );

  window.addEventListener(
    "storage",
    handleChange
  );

  return () => {
    window.removeEventListener(
      CHANGE_EVENT,
      handleChange
    );

    window.removeEventListener(
      "storage",
      handleChange
    );
  };
}

/* =========================================================
   SAVE EVENT DRAFT
========================================================= */

export function saveEventDraft(
  event: Partial<EventDraft>
): EventDraft {
  const existing =
    getAllEventDrafts();

  /*
   * IMPORTANT:
   *
   * If the event already exists, MERGE it.
   *
   * This prevents a page such as:
   *
   * Paid Tickets
   *
   * from accidentally deleting:
   *
   * title
   * description
   * image
   * location
   * organizer
   * etc.
   */
  const existingEvent =
    event.id
      ? existing.find(
          (item) =>
            item.id === event.id
        )
      : undefined;

  const merged: Partial<EventDraft> =
    existingEvent
      ? {
          ...existingEvent,
          ...event,

          /*
           * Keep nested organizer safe.
           */
          organizer:
            event.organizer ??
            existingEvent.organizer,

          /*
           * Keep tickets when a page does not
           * send them.
           */
          tickets:
            event.tickets ??
            existingEvent.tickets,
        }
      : {
          ...event,
        };

  const clean =
    sanitizeEvent(
      merged
    );

  const index =
    existing.findIndex(
      (item) =>
        item.id === clean.id
    );

  let nextEvents: EventDraft[];

  if (index === -1) {
    nextEvents = [
      ...existing,
      clean,
    ];
  } else {
    nextEvents = [
      ...existing,
    ];

    nextEvents[index] =
      clean;
  }

  updateStore(
    nextEvents
  );

  return clean;
}

/* =========================================================
   CREATE EVENT DRAFT
========================================================= */

export function createEventDraft(
  data?: Partial<EventDraft>
): EventDraft {
  const draft =
    sanitizeEvent({
      ...data,

      id:
        data?.id ||
        createId(),

      status:
        data?.status ||
        "draft",

      tickets:
        data?.tickets ||
        [],

      createdAt:
        data?.createdAt ||
        currentTime(),
    });

  updateStore([
    ...getAllEventDrafts(),
    draft,
  ]);

  return draft;
}

/* =========================================================
   SAVE DRAFT
========================================================= */

export function saveDraft(
  event: Partial<EventDraft>
): EventDraft {
  return saveEventDraft({
    ...event,

    status: "draft",
  });
}

/* =========================================================
   SUBMIT FOR REVIEW
========================================================= */

export function submitEventForReview(
  id: string
): EventDraft | null {
  const event =
    getEventDraft(id);

  if (!event) {
    return null;
  }

  return saveEventDraft({
    ...event,

    status:
      "pending-review",

    submittedAt:
      currentTime(),

    rejectionReason:
      undefined,
  });
}

/* =========================================================
   ADMIN APPROVE
========================================================= */

export function approveOrganizerEvent(
  id: string
): EventDraft | null {
  const event =
    getEventDraft(id);

  if (!event) {
    return null;
  }

  return saveEventDraft({
    ...event,

    status:
      "published",

    publishedAt:
      currentTime(),

    rejectionReason:
      undefined,
  });
}

/* =========================================================
   ADMIN REJECT
========================================================= */

export function rejectOrganizerEvent(
  id: string,
  reason: string
): EventDraft | null {
  const event =
    getEventDraft(id);

  if (!event) {
    return null;
  }

  return saveEventDraft({
    ...event,

    status:
      "rejected",

    rejectionReason:
      reason.trim() ||
      "Event was rejected by admin.",
  });
}

/* =========================================================
   ADMIN UNPUBLISH
========================================================= */

export function unpublishOrganizerEvent(
  id: string
): EventDraft | null {
  const event =
    getEventDraft(id);

  if (!event) {
    return null;
  }

  return saveEventDraft({
    ...event,

    status: "draft",

    rejectionReason:
      "Event has been unpublished by admin.",
  });
}

/* =========================================================
   END EVENT
========================================================= */

export function endOrganizerEvent(
  id: string
): EventDraft | null {
  const event =
    getEventDraft(id);

  if (!event) {
    return null;
  }

  return saveEventDraft({
    ...event,

    status: "ended",

    endedAt:
      currentTime(),
  });
}

/* =========================================================
   CANCEL EVENT
========================================================= */

export function cancelOrganizerEvent(
  id: string
): EventDraft | null {
  const event =
    getEventDraft(id);

  if (!event) {
    return null;
  }

  return saveEventDraft({
    ...event,

    status:
      "cancelled",

    cancelledAt:
      currentTime(),
  });
}

/* =========================================================
   DELETE EVENT
========================================================= */

export function deleteOrganizerEvent(
  id: string
): boolean {
  const existing =
    getAllEventDrafts();

  const next =
    existing.filter(
      (event) =>
        event.id !== id
    );

  if (
    next.length ===
    existing.length
  ) {
    return false;
  }

  updateStore(next);

  return true;
}

/* =========================================================
   CLEAR DEVELOPMENT EVENTS
========================================================= */

export function clearAllEventDrafts(): void {
  updateStore([]);
}

/* =========================================================
   CONVERT DRAFT → PUBLIC EVENT
========================================================= */

export function convertDraftToEvent(
  draft: EventDraft
): Event {
  const organizer = {
    id:
      draft.organizer?.id ||
      draft.organizerId ||
      "organizer",

    name:
      draft.organizer?.name ||
      "Organizer",

    image:
      draft.organizer?.image ||
      draft.organizerImage,
  };

  return {
    id: draft.id,

    slug: draft.slug,

    title: draft.title,

    description:
      draft.description,

    image:
      draft.image,

    organizerImage:
      draft.organizerImage,

    category:
      draft.category,

    date:
      draft.date,

    time:
      draft.time ||
      draft.startTime ||
      "",

    location:
      draft.location,

    venue:
      draft.venue,

    address:
      draft.address,

    latitude:
      draft.latitude ??
      0,

    longitude:
      draft.longitude ??
      0,

    organizer,

    tickets:
      draft.tickets.map(
        (ticket) => ({
          id:
            ticket.id,

          name:
            ticket.name,

          price:
            ticket.price,

          quantity:
            ticket.quantity,

          sold:
            ticket.sold || 0,
        })
      ),

    status:
      draft.status,

    createdAt:
      draft.createdAt,

    updatedAt:
      draft.updatedAt,
  };
}

/* =========================================================
   PUBLISHED EVENTS
========================================================= */

export function getPublishedEvents(): Event[] {
  return getPublishedEventDrafts().map(
    convertDraftToEvent
  );
}

/* =========================================================
   REFRESH STORE
========================================================= */

export function refreshEventDraftStore(): void {
  if (!isBrowser()) {
    return;
  }

  initialized = false;

  initialize();

  notify();
}