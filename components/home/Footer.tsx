"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand & Socials Section */}
          <div>
            <h3 className="text-lg font-semibold tracking-wide">
              TEEKET
            </h3>

            <p className="mt-5 max-w-xs text-sm leading-6 text-gray-400">
              Find events that match your vibe, manage and sell tickets with no
              stress on just one platform.
            </p>

            {/* Social Icons Custom SVGs (Fixes lucide icon removal error) */}
            <div className="mt-6 flex items-center gap-5">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Facebook Page"
                className="text-gray-400 transition hover:text-[#7C3AED]"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="X Account"
                className="text-sm font-bold text-gray-400 transition hover:text-[#7C3AED]"
              >
                X
              </a>

              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram Profile"
                className="text-gray-400 transition hover:text-[#7C3AED]"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider">
              Quick Links
            </h4>
            <ul className="mt-5 space-y-4 text-sm text-gray-400">
              <li>
                <Link href="/event" className="transition hover:text-white">
                  Discover events
                </Link>
              </li>
              <li>
                <Link href="/create-event" className="transition hover:text-white">
                  Create events
                </Link>
              </li>
              <li>
                <Link href="/features" className="transition hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/signup" className="transition hover:text-white">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider">
              Legal
            </h4>
            <ul className="mt-5 space-y-4 text-sm text-gray-400">
              <li>
                <Link href="/privacy-policy" className="transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="transition hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider">
              Contact
            </h4>
            <div className="mt-5 space-y-4 text-sm text-gray-400">
              <p className="flex items-center gap-3">
                <Mail size={17} className="text-[#7C3AED]" />
                info@teeket.com
              </p>

              <p className="flex items-center gap-3">
                <Phone size={17} className="text-[#7C3AED]" />
                091127865380
              </p>

              <p className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 text-[#7C3AED]" />
                <span>22, Allen Avenue, Ikeja, Lagos.</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="mt-20 border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
          © 2026 Teeket. All rights reserved
        </div>
      </div>
    </footer>
  );
}
