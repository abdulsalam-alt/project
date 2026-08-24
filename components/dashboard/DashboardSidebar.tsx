"use client";

import Link from "next/link";

import {
  CalendarDays,
  CalendarPlus,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

import { useState } from "react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    return (
      pathname === path ||
      pathname.startsWith(`${path}/`)
    );
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    closeMobileMenu();

    // Backend logout will be connected here later.
    router.push("/login");
  };

  return (
    <>
      {/* ================================================================
          MOBILE HEADER
      ================================================================ */}

      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        {/* Logo */}

        <Link
          href="/dashboard/events"
          onClick={closeMobileMenu}
          className="text-2xl font-bold tracking-tight text-[#241507]"
        >
          TEEKET
        </Link>

        {/* Hamburger */}

        <button
          type="button"
          aria-label={
            mobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileOpen}
          onClick={() =>
            setMobileOpen((current) => !current)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#241507] transition hover:bg-gray-100"
        >
          {mobileOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </header>

      {/* ================================================================
          MOBILE OVERLAY
      ================================================================ */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* ================================================================
          SIDEBAR
      ================================================================ */}

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
          ease-in-out
          md:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ================================================================
            DESKTOP LOGO
        ================================================================ */}

        <div className="mb-12 flex items-center justify-between">
          <Link
            href="/dashboard/events"
            onClick={closeMobileMenu}
            className="px-2 text-3xl font-bold tracking-tight text-[#241507]"
          >
            TEEKET
          </Link>

          {/* Mobile close */}

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 md:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* ================================================================
            NAVIGATION
        ================================================================ */}

        <nav className="flex flex-1 flex-col gap-3">
          {/* ------------------------------------------------------------
              CREATE EVENT
          ------------------------------------------------------------ */}

          <Link
            href="/dashboard/create-event"
            onClick={closeMobileMenu}
            className={`
              flex
              items-center
              gap-4
              rounded-xl
              px-4
              py-4
              text-base
              font-medium
              transition
              ${
                isActive("/dashboard/create-event")
                  ? "bg-[#a37829] text-[#0f0f0f]"
                  : "text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            <CalendarPlus size={22} />

            <span>Create Event</span>
          </Link>

          {/* ------------------------------------------------------------
              EVENTS
          ------------------------------------------------------------ */}

          <Link
            href="/dashboard/events"
            onClick={closeMobileMenu}
            className={`
              flex
              items-center
              gap-4
              rounded-xl
              px-4
              py-4
              text-base
              font-medium
              transition
              ${
                isActive("/dashboard/events")
                  ? "bg-[#F0E5FF] text-[#7C3AED]"
                  : "text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            <CalendarDays size={22} />

            <span>Events</span>
          </Link>

          {/* ------------------------------------------------------------
              ACCOUNT
          ------------------------------------------------------------ */}

          <Link
            href="/dashboard/account"
            onClick={closeMobileMenu}
            className={`
              flex
              items-center
              gap-4
              rounded-xl
              px-4
              py-4
              text-base
              font-medium
              transition
              ${
                isActive("/dashboard/account")
                  ? "bg-[#F0E5FF] text-[#7C3AED]"
                  : "text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            <User size={22} />

            <span>Account</span>
          </Link>
        </nav>

        {/* ================================================================
            LOGOUT
        ================================================================ */}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-4 rounded-xl px-4 py-4 text-base font-medium text-red-500 transition hover:bg-red-50"
        >
          <LogOut size={22} />

          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}