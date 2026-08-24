"use client";

import {
  Ticket,
  TrendingUp,
} from "lucide-react";

import {
  useSyncExternalStore,
} from "react";

import {
  getOrganizerEvents,
  subscribeToEventDrafts,
  type EventDraft,
} from "@/lib/dashboard/eventDraft";

const EMPTY_EVENTS: EventDraft[] = [];

function getServerEvents() {
  return EMPTY_EVENTS;
}

export default function AdminTicketsPage() {
  const events =
    useSyncExternalStore(
      subscribeToEventDrafts,
      getOrganizerEvents,
      getServerEvents
    );

  const publishedEvents =
    events.filter(
      (event) =>
        event.status === "published"
    );

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
          Tickets
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Monitor ticket sales across
          published events.
        </p>

        <div className="mt-7 space-y-5">
          {publishedEvents.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
              <Ticket
                size={42}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-5 font-semibold">
                No published events
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Ticket sales will appear
                here after events are
                published.
              </p>
            </div>
          ) : (
            publishedEvents.map(
              (event) => (
                <TicketEvent
                  key={event.id}
                  event={event}
                />
              )
            )
          )}
        </div>
      </div>
    </main>
  );
}

function TicketEvent({
  event,
}: {
  event: EventDraft;
}) {
  const totalQuantity =
    event.tickets.reduce(
      (sum, ticket) =>
        sum + ticket.quantity,
      0
    );

  const totalSold =
    event.tickets.reduce(
      (sum, ticket) =>
        sum + ticket.sold,
      0
    );

  const totalRevenue =
    event.tickets.reduce(
      (sum, ticket) =>
        sum +
        ticket.price *
          ticket.sold,
      0
    );

  const remaining =
    totalQuantity - totalSold;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#241507]">
            {event.title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {event.date} •{" "}
            {event.location}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
          <TrendingUp size={17} />
          ₦{totalRevenue.toLocaleString()}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          label="Total"
          value={totalQuantity}
        />

        <Metric
          label="Sold"
          value={totalSold}
        />

        <Metric
          label="Remaining"
          value={remaining}
        />

        <Metric
          label="Revenue"
          value={`₦${totalRevenue.toLocaleString()}`}
        />
      </div>

      <div className="mt-6 space-y-3">
        {event.tickets.map(
          (ticket) => {
            const ticketRemaining =
              ticket.quantity -
              ticket.sold;

            const revenue =
              ticket.price *
              ticket.sold;

            return (
              <div
                key={ticket.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">
                      {ticket.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      ₦
                      {ticket.price.toLocaleString()}{" "}
                      per ticket
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-right text-sm">
                    <div>
                      <p className="text-xs text-gray-400">
                        Sold
                      </p>

                      <p className="font-semibold">
                        {ticket.sold}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Left
                      </p>

                      <p className="font-semibold">
                        {ticketRemaining}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Revenue
                      </p>

                      <p className="font-semibold">
                        ₦
                        {revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-[#241507]">
        {typeof value === "number"
          ? value.toLocaleString()
          : value}
      </p>
    </div>
  );
}