"use client";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";

/* =========================================================
   TYPES
========================================================= */

interface EventLocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (
    latitude: number,
    longitude: number
  ) => void;
}

/* =========================================================
   MARKER ICON
========================================================= */

const markerIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41],
});

/* =========================================================
   MAP CENTER UPDATER
========================================================= */

function MapCenterUpdater({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    map.flyTo(
      [latitude, longitude],
      15,
      {
        duration: 0.8,
      }
    );
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
}

/* =========================================================
   MAP CLICK
========================================================= */

function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange?: (
    latitude: number,
    longitude: number
  ) => void;
}) {
  useMapEvents({
    click(event) {
      if (!onLocationChange) {
        return;
      }

      onLocationChange(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function EventLocationMap({
  latitude,
  longitude,
  onLocationChange,
}: EventLocationMapProps) {
  const validCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  if (!validCoordinates) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-100">
        <div className="text-center">
          <p className="font-medium text-gray-700">
            Select a location
          </p>

          <p className="mt-1 text-sm text-gray-500">
            The map will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl border border-gray-200">
      <MapContainer
        center={[
          latitude,
          longitude,
        ]}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater
          latitude={latitude}
          longitude={longitude}
        />

        <MapClickHandler
          onLocationChange={
            onLocationChange
          }
        />

        <Marker
          position={[
            latitude,
            longitude,
          ]}
          icon={markerIcon}
          draggable={Boolean(
            onLocationChange
          )}
          eventHandlers={{
            dragend(event) {
              if (!onLocationChange) {
                return;
              }

              const marker =
                event.target;

              const position =
                marker.getLatLng();

              onLocationChange(
                position.lat,
                position.lng
              );
            },
          }}
        />
      </MapContainer>
    </div>
  );
}