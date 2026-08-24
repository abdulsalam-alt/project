import {
  apiRequest,
} from "@/lib/api/client";

import type {
  CreateEventPayload,
  Event,
  EventStatus,
  UpdateEventPayload,
} from "@/lib/dashboard/event";

export async function createEvent(
  payload: CreateEventPayload
): Promise<Event> {
  return apiRequest<Event>(
    "/events",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function getEvent(
  id: string
): Promise<Event> {
  return apiRequest<Event>(
    `/events/${encodeURIComponent(id)}`
  );
}

export async function updateEvent(
  id: string,
  payload: UpdateEventPayload
): Promise<Event> {
  return apiRequest<Event>(
    `/events/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function getOrganizerEvents(): Promise<
  Event[]
> {
  return apiRequest<Event[]>(
    "/events/organizer"
  );
}

export async function deleteEvent(
  id: string
): Promise<void> {
  await apiRequest<void>(
    `/events/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}

export async function submitEventForReview(
  id: string
): Promise<Event> {
  return updateEvent(id, {
    status: "pending-review",
    currentStep: "review",
  });
}

export async function getEventsByStatus(
  status: EventStatus
): Promise<Event[]> {
  return apiRequest<Event[]>(
    `/events/organizer?status=${encodeURIComponent(
      status
    )}`
  );
}