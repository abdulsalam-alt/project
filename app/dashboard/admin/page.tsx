"use client";

import Link from "next/link";

import {
  CalendarDays,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      label: "Total Users",
      value: "0",
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "Total Events",
      value: "0",
      icon: CalendarDays,
      href: "/admin/event",
    },
    {
      label: "Total Orders",
      value: "0",
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      label: "Tickets Sold",
      value: "0",
      icon: Ticket,
      href: "/admin/tickets",
    },
  ];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div>
          <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Monitor and manage the TEEKET platform.
          </p>
        </div>

        {/* Stats */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#432616]/10 text-[#432616]">
                    <Icon size={22} />
                  </div>
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-2xl font-bold text-[#241507]">
                  {stat.value}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Quick actions */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-[#241507]">
            Quick Management
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/events"
              className="rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50"
            >
              <CalendarDays size={20} />

              <p className="mt-3 font-semibold">
                Manage Events
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Review and approve events.
              </p>
            </Link>

            <Link
              href="/admin/users"
              className="rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50"
            >
              <Users size={20} />

              <p className="mt-3 font-semibold">
                Manage Users
              </p>

              <p className="mt-1 text-sm text-gray-500">
                View and manage users.
              </p>
            </Link>

            <Link
              href="/admin/orders"
              className="rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50"
            >
              <ShoppingCart size={20} />

              <p className="mt-3 font-semibold">
                Manage Orders
              </p>

              <p className="mt-1 text-sm text-gray-500">
                View ticket purchases.
              </p>
            </Link>

            <Link
              href="/admin/tickets"
              className="rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50"
            >
              <Ticket size={20} />

              <p className="mt-3 font-semibold">
                Manage Tickets
              </p>

              <p className="mt-1 text-sm text-gray-500">
                View tickets sold.
              </p>
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}