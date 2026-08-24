"use client";

import {
  APIProvider,
  Map,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { SelectedLocation } from "./LocationTimeForm";

interface Props {
  value: SelectedLocation | null;
  onChange: (location: SelectedLocation) => void;
}

const DEFAULT_CENTER = {
  lat: 6.5244,
  lng: 3.3792,
};

export default function GoogleLocationPicker({
  value,
  onChange,
}: Props) {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Google Maps API key is missing.
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={["places"]}
    >
      <LocationPickerContent
        value={value}
        onChange={onChange}
      />
    </APIProvider>
  );
}

function LocationPickerContent({
  value,
  onChange,
}: Props) {
  const map = useMap();

  const placesLibrary =
    useMapsLibrary("places");

  const [input, setInput] = useState(
    value?.venue || ""
  );

  const [searching, setSearching] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const [markerPosition, setMarkerPosition] =
    useState(
      value
        ? {
            lat: value.latitude,
            lng: value.longitude,
          }
        : DEFAULT_CENTER
    );

  const [mapCenter, setMapCenter] =
    useState(
      value
        ? {
            lat: value.latitude,
            lng: value.longitude,
          }
        : DEFAULT_CENTER
    );

  /*
   * Keep the input synchronized if the parent changes.
   */
  useEffect(() => {
    if (value?.venue) {
      setInput(value.venue);

      const position = {
        lat: value.latitude,
        lng: value.longitude,
      };

      setMarkerPosition(position);
      setMapCenter(position);
    }
  }, [value]);

  /*
   * Search Google Places.
   */
  const handleSearch = async () => {
    if (!input.trim()) {
      setSearchError(
        "Enter a venue or location to search."
      );

      return;
    }

    if (!placesLibrary) {
      setSearchError(
        "Google Places is still loading. Please try again."
      );

      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      /*
       * Use Google Maps Geocoder so searches such as:

       * Ifo
       * Landmark Event Centre
       * Victoria Island Lagos
       * University of Lagos

       * can return coordinates and address.
       */

      const geocoder =
        new google.maps.Geocoder();

      const result = await geocoder.geocode({
        address: input,
        region: "NG",
      });

      if (!result.results.length) {
        setSearchError(
          "Location not found. Try another search."
        );

        return;
      }

      const place = result.results[0];

      const geometry =
        place.geometry.location;

      const latitude = geometry.lat();
      const longitude = geometry.lng();

      const address =
        place.formatted_address || input;

      /*
       * Google may return a POI name in the
       * address components. If it doesn't, use
       * the user's search text as the venue.
       */
      const venue =
        place.address_components?.find(
          (component) =>
            component.types.includes(
              "establishment"
            ) ||
            component.types.includes(
              "point_of_interest"
            )
        )?.long_name || input;

      const position = {
        lat: latitude,
        lng: longitude,
      };

      setMarkerPosition(position);
      setMapCenter(position);

      /*
       * Move the map immediately.
       */
      map?.panTo(position);
      map?.setZoom(16);

      /*
       * Send complete location data to parent.
       */
      onChange({
        venue,
        address,
        latitude,
        longitude,
      });
    } catch (error) {
      console.error(
        "Google location search error:",
        error
      );

      setSearchError(
        "Unable to find this location. Please try again."
      );
    } finally {
      setSearching(false);
    }
  };

  /*
   * Search with Enter.
   */
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  /*
   * Update manually entered address.
   *
   * Important:
   * Changing the address text does NOT change
   * latitude/longitude automatically.
   *
   * The selected Google location remains the
   * actual map location.
   */
  const handleAddressChange = (
    address: string
  ) => {
    if (!value) return;

    onChange({
      ...value,
      address,
    });
  };

  return (
    <div>
      {/* SEARCH */}
      <label className="mb-2 block text-sm font-medium text-[#241507]">
        <span className="text-red-500">*</span>{" "}
        Search Venue
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setSearchError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search venue or location e.g. Ifo"
            className="h-14 w-full rounded-xl border border-gray-300 pl-11 pr-4 outline-none transition focus:border-[#432616]"
          />
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="h-14 rounded-xl bg-[#432616] px-7 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {searchError && (
        <p className="mt-2 text-sm text-red-500">
          {searchError}
        </p>
      )}

      {/* SELECTED VENUE */}
      {value && (
        <div className="mt-6 rounded-xl border border-[#432616]/20 bg-[#432616]/5 p-4">
          <div className="flex items-start gap-3">
            <MapPin
              size={20}
              className="mt-0.5 shrink-0 text-[#432616]"
            />

            <div>
              <p className="font-semibold text-[#241507]">
                {value.venue}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {value.address}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {value.latitude.toFixed(6)},{" "}
                {value.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAP */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
        <div className="h-[350px]">
          <Map
            defaultCenter={DEFAULT_CENTER}
            center={mapCenter}
            defaultZoom={12}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapId="TEEKET_EVENT_LOCATION_MAP"
          >
            <Marker
              position={markerPosition}
              title={
                value?.venue ||
                "Event location"
              }
            />
          </Map>
        </div>
      </div>

      {/* MANUAL ADDRESS */}
      {value && (
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-[#241507]">
            <span className="text-red-500">*</span>{" "}
            Event Address
          </label>

          <textarea
            value={value.address}
            onChange={(event) =>
              handleAddressChange(
                event.target.value
              )
            }
            rows={3}
            placeholder="Enter the exact event address"
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#432616]"
          />

          <p className="mt-2 text-xs text-gray-400">
            You can edit the address manually. The map
            coordinates remain tied to the selected venue.
          </p>
        </div>
      )}
    </div>
  );
}