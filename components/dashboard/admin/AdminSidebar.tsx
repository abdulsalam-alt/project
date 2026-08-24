"use client";

import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  LogOut,
  Menu,
  ShoppingBag,
  Ticket,
  Users,
  X,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const adminLinks = [
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    icon: BarChart3,
  },
  {
    label: "Events",
    href: "/dashboard/admin/event",
    icon: CalendarDays,
  },
  {
    label: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    label: "Orders",
    href: "/dashboard/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Tickets",
    href: "/dashboard/admin/tickets",
    icon: Ticket,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard/admin") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("teeket:session");

    closeMobile();

    router.push("/login");
  };

  return (
    <>
      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <Link
          href="/dashboard/admin"
          onClick={closeMobile}
          className="text-2xl font-bold tracking-tight text-[#241507]"
        >
          TEEKET
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileOpen((value) => !value)
          }
          aria-label={
            mobileOpen
              ? "Close admin navigation"
              : "Open admin navigation"
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#241507] hover:bg-gray-100"
        >
          {mobileOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </header>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-[280px]
          flex-col
          border-r
          border-gray-200
          bg-white
          px-6
          py-8
          transition-transform
          duration-300
          md:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}

        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/dashboard/admin"
            onClick={closeMobile}
            className="px-2 text-3xl font-bold tracking-tight text-[#241507]"
          >
            TEEKET
          </Link>

          <button
            type="button"
            onClick={closeMobile}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Admin badge */}

        <div className="mb-6 rounded-xl bg-[#432616] px-4 py-3">
          <p className="text-xs font-medium text-white/60">
            TEEKET
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            Admin Dashboard
          </p>
        </div>

        {/* Navigation */}

        <nav className="flex flex-1 flex-col gap-2">
          {adminLinks.map((item) => {
            const Icon = item.icon;

            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`
                  flex
                  items-center
                  gap-4
                  rounded-xl
                  px-4
                  py-3.5
                  text-sm
                  font-medium
                  transition
                  ${
                    active
                      ? "bg-[#F0E5FF] text-[#7C3AED]"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <Icon size={21} />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <LogOut size={21} />

          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}