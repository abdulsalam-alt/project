export type EventStatus =
  | "draft"
  | "pending-review"
  | "published"
  | "ended"
  | "rejected";

export type EventCreationStep =
  | "details"
  | "location"
  | "tickets"
  | "review";

export type EventCategory =
  | "community"
  | "art-culture"
  | "sport-wellness"
  | "career-business"
  | "concerts"
  | "food-drinks"
  | "spirituality-religion"
  | "night-life";

export interface EventTicket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
}

export interface EventLocation {
  location: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  placeId?: string | null;
}

export interface Event {
  id: string;

  organizerId: string;

  title: string;
  description: string;
  category: EventCategory;
  image: string | null;

  location: string;
  address: string;

  latitude: number | null;
  longitude: number | null;

  date: string;
  startTime: string;
  endTime: string;

  tickets: EventTicket[];

  status: EventStatus;
  currentStep: EventCreationStep;

  rejectionReason?: string | null;

  createdAt: string;
  updatedAt: string;
}

export type EventDraft = Event;

export interface CreateEventPayload {
  title: string;
  description: string;
  category: EventCategory;
  image: string | null;

  currentStep?: EventCreationStep;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  category?: EventCategory;
  image?: string | null;

  location?: string;
  address?: string;

  latitude?: number | null;
  longitude?: number | null;
  placeId?: string | null;

  date?: string;
  startTime?: string;
  endTime?: string;

  tickets?: EventTicket[];

  currentStep?: EventCreationStep;
  status?: EventStatus;
}