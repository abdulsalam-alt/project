"use client";

import Image from "next/image";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";

export interface OrganizerEvent {
  id: string;
  title: string;
  category: string;
  coverImage?: string | null;
  date: string;
  location: string;
  status: "draft" | "pending_review" | "published" | "ended";
  ticketsSold: number;
  ticketsRemaining: number;
}

interface EventCardProps {
  event: OrganizerEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  const statusStyles = {
    draft: "bg-gray-100 text-gray-700",
    pending_review: "bg-yellow-100 text-yellow-700",
    published: "bg-green-100 text-green-700",
    ended: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    draft: "Draft",
    pending_review: "Pending Admin Review",
    published: "Published",
    ended: "Ended",
  };

  return (
    <button
      type="button"
      onClick={() => router.push(`/dashboard/events/${event.id}`)}
      className="w-full text-left"
    >
      <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-52 w-full overflow-hidden bg-gray-100">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black">
              <span className="text-2xl font-bold tracking-widest text-white">
                TEEKET
              </span>
            </div>
          )}

          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium ${
              statusStyles[event.status]
            }`}
          >
            {statusLabels[event.status]}
          </span>
        </div>

        <div className="p-5">
          <p className="text-sm font-medium text-[#7C3AED]">
            {event.category}
          </p>

          <h3 className="mt-1 text-xl font-semibold text-[#241507]">
            {event.title}
          </h3>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarDays size={17} />
              <span>{event.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={17} />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Ticket size={17} />
              <span>
                {event.ticketsSold} sold · {event.ticketsRemaining} remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}