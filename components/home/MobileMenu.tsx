"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: Props) {
  // Lock underlying background scroll when mobile menu layer is active
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 p-6 h-16">
        <h2 className="text-2xl font-bold text-white tracking-wide">
          TEEKET
        </h2>
        <button 
          onClick={onClose}
          className="focus:outline-none"
          aria-label="Close navigation menu"
        >
          <X size={26} className="text-white" />
        </button>
      </div>

      {/* Navigation Drawer Content */}
      <nav className="flex flex-col gap-8 p-8 h-[calc(100vh-64px)] overflow-y-auto">
        <Link
          href="/event"
          onClick={onClose}
          className="text-lg text-white font-medium transition hover:text-[#7C3AED]"
        >
          Discover
        </Link>

        <Link
          href="/create-event"
          onClick={onClose}
          className="text-lg text-white font-medium transition hover:text-[#7C3AED]"
        >
          Create event
        </Link>

        <Link
          href="/features"
          onClick={onClose}
          className="text-lg text-white font-medium transition hover:text-[#7C3AED]"
        >
          Features
        </Link>

        <button 
          onClick={onClose}
          className="flex items-center gap-3 text-lg text-white font-medium text-left transition hover:text-[#7C3AED] focus:outline-none"
        >
          <Search size={20} />
          Search
        </button>

        {/* Action Buttons */}
        <div className="mt-auto mb-6 flex flex-col gap-4">
          <Link
            href="/login"
            onClick={onClose}
            className="rounded-full border border-[#7C3AED] py-3 text-center text-sm font-medium text-white transition hover:bg-[#7C3AED]/10"
          >
            Log in
          </Link>

          <Link
            href="/signup"
            onClick={onClose}
            className="rounded-full bg-[#7C3AED] py-3 text-center text-sm font-medium text-white transition hover:bg-[#6D28D9]"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </div>
  );
}
