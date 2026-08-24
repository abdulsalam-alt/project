// lib/dashboard/eventDraft.ts

import type {
  Event,
  EventCategory,
  EventStatus,
  EventTicket,
} from "@/lib/data/event";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export type DraftTicket = EventTicket;

export interface EventDraft {
  id: string;

  /* Event details */
  title: string;
  description: string;
  category: EventCategory;

  image: string;

  /* Location */
  location: string;
  address: string;
  latitude: number | null;
  longitude: number | null;

  /* Date & time */
  date: string;
  startTime: string;
  endTime: string;

  /* Organizer */
  organizer: string;
  organizerImage: string;
  organizerDescription: string;

  /* Tickets */
  tickets: DraftTicket[];

  /* Status */
  status: EventStatus;

  /* Creation step */
  currentStep: "details" | "location" | "tickets";

  /* Dates */
  createdAt: string;
  updatedAt: string;
}

/*
|--------------------------------------------------------------------------
| STORAGE
|--------------------------------------------------------------------------
*/

const STORAGE_KEY =
  "teeket-organizer-event-drafts";

/*
|--------------------------------------------------------------------------
| ID
|--------------------------------------------------------------------------
*/

function createId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
}

/*
|--------------------------------------------------------------------------
| EMPTY DRAFT
|--------------------------------------------------------------------------
*/

export function emptyDraft(): EventDraft {
  const now = new Date().toISOString();

  return {
    id: createId(),

    title: "",
    description: "",
    category: "",

    image: "",

    location: "",
    address: "",
    latitude: null,
    longitude: null,

    date: "",
    startTime: "",
    endTime: "",

    organizer: "",
    organizerImage: "",
    organizerDescription: "",

    tickets: [],

    status: "draft",

    currentStep: "details",

    createdAt: now,
    updatedAt: now,
  };
}

/*
|--------------------------------------------------------------------------
| READ ALL DRAFTS
|--------------------------------------------------------------------------
*/

export function getEventDrafts(): EventDraft[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(
      "Unable to read event drafts:",
      error
    );

    return [];
  }
}

/*
|--------------------------------------------------------------------------
| SAVE ALL DRAFTS
|--------------------------------------------------------------------------
*/

function saveAllEventDrafts(
  drafts: EventDraft[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(drafts)
  );

  /*
   * Notify the rest of the dashboard.
   */
  window.dispatchEvent(
    new CustomEvent(
      "teeket-organizer-events-updated"
    )
  );
}

/*
|--------------------------------------------------------------------------
| GET ONE DRAFT
|--------------------------------------------------------------------------
*/

export function getEventDraft(
  id: string
): EventDraft | null {
  const drafts = getEventDrafts();

  return (
    drafts.find(
      (draft) => draft.id === id
    ) ?? null
  );
}

/*
|--------------------------------------------------------------------------
| SAVE / UPDATE DRAFT
|--------------------------------------------------------------------------
*/

export function saveEventDraft(
  data: Partial<EventDraft> & {
    id?: string;
  }
): EventDraft {
  const drafts = getEventDrafts();

  const now =
    new Date().toISOString();

  /*
   * Updating an existing draft.
   */
  if (data.id) {
    const existingIndex =
      drafts.findIndex(
        (draft) =>
          draft.id === data.id
      );

    if (existingIndex !== -1) {
      const existing =
        drafts[existingIndex];

      const updated: EventDraft = {
        ...existing,
        ...data,

        id: existing.id,

        updatedAt: now,
      };

      drafts[existingIndex] =
        updated;

      saveAllEventDrafts(drafts);

      return updated;
    }
  }

  /*
   * Creating a new draft.
   */
  const newDraft: EventDraft = {
    ...emptyDraft(),

    ...data,

    id:
      data.id ??
      createId(),

    status:
      data.status ??
      "draft",

    currentStep:
      data.currentStep ??
      "details",

    tickets:
      data.tickets ??
      [],

    createdAt:
      data.createdAt ??
      now,

    updatedAt: now,
  };

  drafts.push(newDraft);

  saveAllEventDrafts(drafts);

  return newDraft;
}

/*
|--------------------------------------------------------------------------
| DELETE ONE DRAFT
|--------------------------------------------------------------------------
*/

export function deleteEventDraft(
  id: string
): boolean {
  const drafts = getEventDrafts();

  const filtered =
    drafts.filter(
      (draft) =>
        draft.id !== id
    );

  if (
    filtered.length ===
    drafts.length
  ) {
    return false;
  }

  saveAllEventDrafts(
    filtered
  );

  return true;
}

/*
|--------------------------------------------------------------------------
| DELETE ORGANIZER EVENT
|--------------------------------------------------------------------------
|
| This is intentionally the same storage used by the organizer dashboard.
|
*/

export function deleteOrganizerEvent(
  id: string
): boolean {
  return deleteEventDraft(id);
}

/*
|--------------------------------------------------------------------------
| GET ORGANIZER EVENTS
|--------------------------------------------------------------------------
|
| VERY IMPORTANT:
|
| We do NOT import `events` from event.ts here.
|
| Therefore the organizer dashboard will ONLY display
| events created/saved by this organizer.
|
*/

export function getOrganizerEvents(): Event[] {
  const drafts =
    getEventDrafts();

  return drafts.map(
    (draft): Event => ({
      id: draft.id,

      slug:
        createSlug(
          draft.title,
          draft.id
        ),

      title: draft.title,

      description:
        draft.description,

      category:
        draft.category,

      image:
        draft.image,

      location:
        draft.location,

      address:
        draft.address,

      latitude:
        draft.latitude,

      longitude:
        draft.longitude,

      date:
        draft.date,

      startTime:
        draft.startTime,

      endTime:
        draft.endTime,

      time:
        formatTime(
          draft.startTime
        ),

      organizer:
        draft.organizer,

      organizerImage:
        draft.organizerImage,

      organizerDescription:
        draft.organizerDescription,

      tickets:
        draft.tickets,

      status:
        draft.status,

      currentStep:
        draft.currentStep,

      createdAt:
        draft.createdAt,

      updatedAt:
        draft.updatedAt,
    })
  );
}

/*
|--------------------------------------------------------------------------
| CONVERT DRAFT TO EVENT
|--------------------------------------------------------------------------
*/

export function getOrganizerEvent(
  id: string
): Event | null {
  const draft =
    getEventDraft(id);

  if (!draft) {
    return null;
  }

  return {
    id: draft.id,

    slug:
      createSlug(
        draft.title,
        draft.id
      ),

    title:
      draft.title,

    description:
      draft.description,

    category:
      draft.category,

    image:
      draft.image,

    location:
      draft.location,

    address:
      draft.address,

    latitude:
      draft.latitude,

    longitude:
      draft.longitude,

    date:
      draft.date,

    startTime:
      draft.startTime,

    endTime:
      draft.endTime,

    time:
      formatTime(
        draft.startTime
      ),

    organizer:
      draft.organizer,

    organizerImage:
      draft.organizerImage,

    organizerDescription:
      draft.organizerDescription,

    tickets:
      draft.tickets,

    status:
      draft.status,

    currentStep:
      draft.currentStep,

    createdAt:
      draft.createdAt,

    updatedAt:
      draft.updatedAt,
  };
}

/*
|--------------------------------------------------------------------------
| UPDATE CURRENT STEP
|--------------------------------------------------------------------------
*/

export function updateDraftStep(
  id: string,
  step:
    | "details"
    | "location"
    | "tickets"
): EventDraft | null {
  const draft =
    getEventDraft(id);

  if (!draft) {
    return null;
  }

  return saveEventDraft({
    ...draft,

    id,

    currentStep: step,
  });
}

/*
|--------------------------------------------------------------------------
| CREATE SLUG
|--------------------------------------------------------------------------
*/

function createSlug(
  title: string,
  id: string
): string {
  const cleanTitle =
    title
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return (
    cleanTitle ||
    `event-${id}`
  );
}

/*
|--------------------------------------------------------------------------
| FORMAT TIME
|--------------------------------------------------------------------------
*/

function formatTime(
  time: string
): string {
  if (!time) {
    return "";
  }

  const [
    hourString,
    minuteString,
  ] = time.split(":");

  const hour =
    Number(hourString);

  const minute =
    minuteString ?? "00";

  if (
    Number.isNaN(hour)
  ) {
    return time;
  }

  const suffix =
    hour >= 12
      ? "PM"
      : "AM";

  const formattedHour =
    hour % 12 || 12;

  return `${formattedHour}:${minute} ${suffix}`;
}