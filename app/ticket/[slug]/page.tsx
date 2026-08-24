"use client";

import { useMemo, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";

import {
  TicketHeader,
  TicketTypeCard,
  OrderSummary,
  EmptyOrder,
} from "@/components/ticket";

import { events } from "@/lib/data/event";

export default function TicketPage() {
  const { slug } = useParams();
  const router = useRouter();

  const event = events.find((event) => event.slug === slug);

  if (!event) {
    notFound();
  }

  // Initialize tickets from the selected event
  const [tickets, setTickets] = useState(
    event.tickets.map((ticket) => ({
      ...ticket,
      quantity: 0,
    }))
  );

  const selectedTickets = useMemo(
    () => tickets.filter((ticket) => ticket.quantity > 0),
    [tickets]
  );

  function updateQuantity(id: string, quantity: number) {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              quantity,
            }
          : ticket
      )
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F7] py-14">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        <TicketHeader eventTitle={event.title} />

        <div className="mt-10 flex flex-col gap-10 lg:flex-row">

          {/* Left */}

          <div className="flex-1 rounded-2xl bg-white p-8 shadow-sm">

            {tickets.map((ticket) => (
              <TicketTypeCard
                key={ticket.id}
                title={ticket.name}
                price={ticket.price}
                description={ticket.description}
                quantity={ticket.quantity}
                available={ticket.available}
                onQuantityChange={(value) =>
                  updateQuantity(ticket.id, value)
                }
              />
            ))}

          </div>

          {/* Right */}

          <div className="w-full lg:w-[380px]">

            {selectedTickets.length === 0 ? (
              <EmptyOrder />
            ) : (
              <OrderSummary
                eventTitle={event.title}
                items={selectedTickets}
                onContinue={() =>
                  router.push(`/checkout/${event.slug}`)
                }
              />
            )}

          </div>

        </div>

      </div>
    </main>
  );
}