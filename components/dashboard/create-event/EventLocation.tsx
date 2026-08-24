"use client";

import { useState } from "react";
import { MapPin, Search, X } from "lucide-react";

import type { EventLocation as EventLocationType } from "@/lib/data/eventDraft";
import EventMap from "./EventMap";

interface EventLocationProps {
  location: EventLocationType | null;
  manualAddress: string;
  error?: string;
  onLocationChange: (
    location: EventLocationType | null
  ) => void;
  onManualAddressChange: (value: string) => void;
}

export default function EventLocation({
  location,
  manualAddress,
  error,
  onLocationChange,
  onManualAddressChange,
}: EventLocationProps) {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    // Google Places search will be connected here.
    // We will implement the autocomplete in the next step.
    console.log("Searching for:", search);
  };

  const clearLocation = () => {
    onLocationChange(null);
    setSearch("");
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">

      <div className="mb-7">
        <h2 className="text-xl font-semibold text-[#241507]">
          Event Location
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Search for your venue or enter the address manually.
        </p>
      </div>

      {/* SEARCH */}

      <div>
        <label className="mb-2 block text-sm font-medium text-[#241507]">
          Search for a venue or location
        </label>

        <div className="relative">

          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Search Ifo, Landmark Event Centre, Lagos..."
            className="h-14 w-full rounded-xl border border-gray-300 pl-12 pr-24 outline-none focus:border-[#432616]"
          />

          <button
            type="button"
            onClick={handleSearch}
            className="absolute right-2 top-2 h-10 rounded-lg bg-[#432616] px-4 text-sm font-medium text-white"
          >
            Search
          </button>

        </div>

        <p className="mt-2 text-xs text-gray-500">
          Search will use Google Maps to find the exact location.
        </p>
      </div>

      {/* SELECTED VENUE */}

      {location && (
        <div className="mt-6 rounded-xl border border-[#432616]/20 bg-[#432616]/5 p-5">

          <div className="flex items-start justify-between gap-4">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#432616]">
                <MapPin
                  size={20}
                  className="text-white"
                />
              </div>

              <div>
                <p className="font-semibold text-[#241507]">
                  {location.name}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {location.address}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {location.latitude}, {location.longitude}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={clearLocation}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-white"
            >
              <X size={18} />
            </button>

          </div>

        </div>
      )}

      {/* MANUAL ADDRESS */}

      <div className="mt-7">

        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-[#241507]">
            Address
          </label>

          <span className="text-xs text-gray-400">
            Optional when a venue is selected
          </span>
        </div>

        <textarea
          value={manualAddress}
          onChange={(e) =>
            onManualAddressChange(e.target.value)
          }
          placeholder="Enter the event address manually..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#432616]"
        />

        <p className="mt-2 text-xs text-gray-500">
          A manually entered address can be geocoded and used to update the map.
        </p>

      </div>

      {/* MAP */}

      <EventMap location={location} />

      {error && (
        <p className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}

    </section>
  );
}