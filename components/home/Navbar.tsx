"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="
          fixed
          top-0
          left-0
          z-50
          w-full
          border-b
          border-white/10
          bg-black/10
          backdrop-blur-xl
        "
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-wide text-white"
          >
            TEEKET
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-14 lg:flex">
            <Link
              href="/discover"
              className="text-sm text-white transition hover:text-[#7C3AED]"
            >
              Discover
            </Link>
            <Link
              href="/login"
              className="text-sm text-white transition hover:text-[#7C3AED]"
            >
              Create event
            </Link>
            <Link
              href="/features"
              className="text-sm text-white transition hover:text-[#7C3AED]"
            >
              Features
            </Link>
          </nav>

          {/* Right Desktop Controls */}
          <div className="hidden items-center gap-5 lg:flex">
            <button aria-label="Search events">
              <Search size={22} className="text-white" />
            </button>
            <Link
              href="/login"
              className="rounded-full border border-[#432616] px-7 py-2.5 text-sm text-white transition hover:bg-[#432616]"
            >
              Log in
            </Link>
            <Link
              href="/create-account"
              className="rounded-full bg-[#8B6045] px-7 py-2.5 text-sm text-white transition hover:bg-[#432616]"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Action Controls */}
          <div className="flex items-center gap-4 lg:hidden">
            <button aria-label="Search events">
              <Search size={22} className="text-white" />
            </button>
            <button 
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation menu"
              className="text-white focus:outline-none"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Connected Mobile Slide-over Menu */}
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
