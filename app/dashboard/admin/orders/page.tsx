"use client";

import {
  CheckCircle2,
  Clock3,
  ShoppingBag,
} from "lucide-react";

export default function AdminOrdersPage() {
  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
            Orders
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View ticket purchases and
            payment status.
          </p>
        </div>

        <section className="mt-7 rounded-2xl border border-gray-200 bg-white">
          <div className="px-5 py-16 text-center">
            <ShoppingBag
              size={42}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-5 font-semibold text-[#241507]">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Orders will appear here when
              attendees start purchasing
              tickets.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}