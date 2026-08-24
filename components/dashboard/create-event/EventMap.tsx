"use client";

import { Map, Marker } from "@vis.gl/react-google-maps";

import type { EventLocation } from "@/lib/data/eventDraft";

interface EventMapProps {
  location: EventLocation | null;
}

export default function EventMap({
  location,
}: EventMapProps) {
  const defaultCenter = {
    lat: 6.5244,
    lng: 3.3792,
  };

  const center = location
    ? {
        lat: location.latitude,
        lng: location.longitude,
      }
    : defaultCenter;

  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200">

      <div className="h-[340px] w-full">

        <Map
          defaultZoom={13}
          center={center}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {location && (
            <Marker
              position={{
                lat: location.latitude,
                lng: location.longitude,
              }}
            />
          )}
        </Map>

      </div>

      <div className="border-t border-gray-200 bg-white px-4 py-3">

        {location ? (
          <p className="text-sm text-gray-600">
            Map location:
            <span className="ml-1 font-medium text-[#241507]">
              {location.name}
            </span>
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Select a location to preview it on the map.
          </p>
        )}

      </div>

    </div>
  );
}