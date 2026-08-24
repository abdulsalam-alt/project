"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface TicketHeaderProps {
  eventTitle: string;
}

export default function TicketHeader({
  eventTitle,
}: TicketHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-10">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-8 flex h-12 w-12 items-center justify-center rounded-md bg-[#241507] text-white transition hover:bg-[#6b3807]"
      >
        <ArrowLeft size={22} />
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-semibold text-[#241507] md:text-5xl">
        Select Ticket
      </h1>

      {/* Event Name */}
      <p className="mt-4 text-lg text-[#4B4B4B] md:text-xl">
        {eventTitle}
      </p>
    </div>
  );
}