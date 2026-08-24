"use client";

import {
  AdvancedMarker,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";

interface EventLocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (
    latitude: number,
    longitude: number
  ) => void;
}

export default function EventLocationMap({
  latitude,
  longitude,
}: EventLocationMapProps) {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl border border-gray-200">
      <Map
        defaultZoom={14}
        center={{
          lat: latitude,
          lng: longitude,
        }}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="TEEKET_EVENT_MAP"
      >
        <AdvancedMarker
          position={{
            lat: latitude,
            lng: longitude,
          }}
        >
          <Pin
            background="#432616"
            borderColor="#241507"
            glyphColor="#FFFFFF"
          />
        </AdvancedMarker>
      </Map>
    </div>
  );
}