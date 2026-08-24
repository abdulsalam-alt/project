"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  Search,
  MapPin,
  Loader2,
  LocateFixed,
} from "lucide-react";

export interface SelectedLocation {
  venue: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value: SelectedLocation | null;
  onChange: (location: SelectedLocation) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  name?: string;
}

interface SearchResponse {
  results: SearchResult[];
}

interface ReverseGeocodeResult {
  display_name?: string;
  name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

const DEFAULT_POSITION: [number, number] = [
  6.5244,
  3.3792,
];

const DEFAULT_ZOOM = 12;

const markerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/* ============================================================================
   MAP CONTROLLER
============================================================================ */

function MapController({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [latitude, longitude],
      Math.max(map.getZoom(), 15),
      {
        animate: true,
      }
    );
  }, [map, latitude, longitude]);

  return null;
}

/* ============================================================================
   MAP CLICK HANDLER
============================================================================ */

function MapClickHandler({
  onSelect,
}: {
  onSelect: (
    latitude: number,
    longitude: number
  ) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

/* ============================================================================
   LOCATION PICKER
============================================================================ */

export default function LeafletLocationPicker({
  value,
  onChange,
}: LocationPickerProps) {
  const [query, setQuery] = useState(
    value?.venue ?? ""
  );

  const [results, setResults] = useState<
    SearchResult[]
  >([]);

  const [searching, setSearching] =
    useState(false);

  const [selecting, setSelecting] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [showResults, setShowResults] =
    useState(false);

  const [mapPosition, setMapPosition] =
    useState<[number, number]>(() => {
      if (
        typeof value?.latitude === "number" &&
        typeof value?.longitude === "number"
      ) {
        return [
          value.latitude,
          value.longitude,
        ];
      }

      return DEFAULT_POSITION;
    });

  const searchTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const searchAbortController =
    useRef<AbortController | null>(null);

  const reverseAbortController =
    useRef<AbortController | null>(null);

  /* ==========================================================================
     SEARCH
  ========================================================================== */

  const searchPlaces = useCallback(
    async (searchValue: string) => {
      const trimmed =
        searchValue.trim();

      if (trimmed.length < 3) {
        setResults([]);
        setShowResults(false);
        return;
      }

      searchAbortController.current?.abort();

      const controller =
        new AbortController();

      searchAbortController.current =
        controller;

      setSearching(true);
      setLocationError("");

      try {
        /*
         * Do not use countrycodes=ng.
         *
         * This allows locations outside Nigeria to
         * still be found and makes the search more
         * flexible.
         */
        const url =
          "https://nominatim.openstreetmap.org/search" +
          `?format=jsonv2` +
          `&addressdetails=1` +
          `&limit=8` +
          `&q=${encodeURIComponent(
            trimmed
          )}`;

        const response =
          await fetch(url, {
            signal: controller.signal,
            headers: {
              Accept:
                "application/json",
            },
          });

        if (!response.ok) {
          throw new Error(
            "Search request failed."
          );
        }

        const data =
          (await response.json()) as SearchResult[];

        if (controller.signal.aborted) {
          return;
        }

        setResults(
          Array.isArray(data)
            ? data
            : []
        );

        setShowResults(true);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Location search error:",
          error
        );

        setResults([]);

        setLocationError(
          "Unable to search locations right now."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setSearching(false);
        }
      }
    },
    []
  );

  /* ==========================================================================
     SEARCH INPUT
  ========================================================================== */

  const handleQueryChange = (
    value: string
  ) => {
    setQuery(value);
    setLocationError("");

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    if (value.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    searchTimer.current =
      setTimeout(() => {
        void searchPlaces(value);
      }, 600);
  };

  /* ==========================================================================
     REVERSE GEOCODE
  ========================================================================== */

  const selectCoordinates =
    useCallback(
      async (
        latitude: number,
        longitude: number
      ) => {
        reverseAbortController.current?.abort();

        const controller =
          new AbortController();

        reverseAbortController.current =
          controller;

        setSelecting(true);
        setLocationError("");

        setMapPosition([
          latitude,
          longitude,
        ]);

        try {
          const url =
            "https://nominatim.openstreetmap.org/reverse" +
            `?format=jsonv2` +
            `&addressdetails=1` +
            `&lat=${encodeURIComponent(
              latitude
            )}` +
            `&lon=${encodeURIComponent(
              longitude
            )}`;

          const response =
            await fetch(url, {
              signal: controller.signal,
              headers: {
                Accept:
                  "application/json",
              },
            });

          if (!response.ok) {
            throw new Error(
              "Reverse geocoding failed."
            );
          }

          const data =
            (await response.json()) as ReverseGeocodeResult;

          if (controller.signal.aborted) {
            return;
          }

          const address =
            data.address;

          const venue =
            data.name ||
            address?.road ||
            address?.pedestrian ||
            address?.neighbourhood ||
            address?.suburb ||
            "Selected location";

          const readableAddress =
            data.display_name ||
            [
              address?.road,
              address?.suburb,
              address?.city ||
                address?.town ||
                address?.village,
              address?.state,
              address?.country,
            ]
              .filter(Boolean)
              .join(", ");

          const selected: SelectedLocation =
            {
              venue,
              address:
                readableAddress ||
                venue,
              latitude,
              longitude,
            };

          setQuery(venue);
          setResults([]);
          setShowResults(false);

          onChange(selected);
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return;
          }

          console.error(
            "Reverse geocoding error:",
            error
          );

          setLocationError(
            "We could not identify this location. Please try another point."
          );
        } finally {
          if (
            !controller.signal.aborted
          ) {
            setSelecting(false);
          }
        }
      },
      [onChange]
    );

  /* ==========================================================================
     SEARCH RESULT SELECTION
  ========================================================================== */

  const handleSelectResult = (
    result: SearchResult
  ) => {
    const latitude =
      Number(result.lat);

    const longitude =
      Number(result.lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setLocationError(
        "This location could not be selected."
      );

      return;
    }

    const venue =
      result.name ||
      result.display_name
        .split(",")[0]
        .trim() ||
      "Selected location";

    const selected: SelectedLocation =
      {
        venue,
        address:
          result.display_name,
        latitude,
        longitude,
      };

    setQuery(venue);

    setMapPosition([
      latitude,
      longitude,
    ]);

    setResults([]);
    setShowResults(false);
    setLocationError("");

    onChange(selected);
  };

  /* ==========================================================================
     CURRENT LOCATION
  ========================================================================== */

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support location services."
      );

      return;
    }

    setSelecting(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void selectCoordinates(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        setSelecting(false);

        setLocationError(
          "Unable to get your current location. Please allow location access."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  /* ==========================================================================
     CLEANUP
  ========================================================================== */

  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(
          searchTimer.current
        );
      }

      searchAbortController.current?.abort();

      reverseAbortController.current?.abort();
    };
  }, []);

  /* ==========================================================================
     MARKER
  ========================================================================== */

  const markerPosition =
    typeof value?.latitude === "number" &&
    typeof value?.longitude === "number"
      ? [
          value.latitude,
          value.longitude,
        ] as [number, number]
      : mapPosition;

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div className="space-y-5">

      {/* SEARCH */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[#241507]">
          Search event location
        </label>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={query}
            onChange={(event) =>
              handleQueryChange(
                event.target.value
              )
            }
            onFocus={() => {
              if (
                results.length > 0
              ) {
                setShowResults(true);
              }
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Escape"
              ) {
                setShowResults(false);
              }
            }}
            placeholder="Search venue, street, city or area"
            className="h-14 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-12 outline-none transition focus:border-[#432616] focus:ring-1 focus:ring-[#432616]"
          />

          {searching && (
            <Loader2
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#432616]"
            />
          )}

          {showResults &&
            results.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[1000] max-h-[320px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">

                {results.map(
                  (result) => (
                    <button
                      key={
                        result.place_id
                      }
                      type="button"
                      onClick={() =>
                        handleSelectResult(
                          result
                        )
                      }
                      className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-gray-50"
                    >
                      <MapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-[#432616]"
                      />

                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[#241507]">
                          {result.name ||
                            result.display_name.split(
                              ","
                            )[0]}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-gray-500">
                          {
                            result.display_name
                          }
                        </span>
                      </span>
                    </button>
                  )
                )}

              </div>
            )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            Search for your venue or click
            directly on the map.
          </p>

          <button
            type="button"
            onClick={
              useCurrentLocation
            }
            disabled={selecting}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#432616] transition hover:bg-[#432616]/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {selecting ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <LocateFixed
                size={15}
              />
            )}

            Use my location
          </button>
        </div>
      </div>

      {/* MAP */}
      <div className="overflow-hidden rounded-2xl border border-gray-200">
        <div className="relative h-[360px] w-full sm:h-[430px]">

          <MapContainer
            center={mapPosition}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler
              onSelect={
                selectCoordinates
              }
            />

            <MapController
              latitude={
                markerPosition[0]
              }
              longitude={
                markerPosition[1]
              }
            />

            <Marker
              position={
                markerPosition
              }
              icon={markerIcon}
            />
          </MapContainer>

          {selecting && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-[#432616] shadow-lg">
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Finding location...
              </div>
            </div>
          )}

        </div>
      </div>

      {locationError && (
        <p className="text-sm font-medium text-red-600">
          {locationError}
        </p>
      )}
    </div>
  );
}