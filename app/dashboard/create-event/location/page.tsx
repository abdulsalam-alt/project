"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  getEventDraft,
  saveEventDraft,
} from "@/lib/dashboard/eventDraft";

import EventLocationMap from "@/components/dashboard/EventLocationMap";

/* =========================================================
   TYPES
========================================================= */

interface NominatimAddress {
  house_number?: string;
  road?: string;

  neighbourhood?: string;
  suburb?: string;

  city?: string;
  town?: string;
  village?: string;

  county?: string;
  state?: string;

  postcode?: string;

  country?: string;
}

interface LocationSearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;

  lat: string;
  lon: string;

  display_name: string;

  name?: string;

  type?: string;

  category?: string;

  address?: NominatimAddress;
}

/* =========================================================
   HELPERS
========================================================= */

function getCity(
  address?: NominatimAddress
): string {
  if (!address) {
    return "";
  }

  return (
    address.city ||
    address.town ||
    address.village ||
    address.suburb ||
    address.county ||
    ""
  );
}

function getVenueName(
  result: LocationSearchResult
): string {
  if (result.name?.trim()) {
    return result.name.trim();
  }

  const address = result.address;

  if (!address) {
    return "";
  }

  if (address.road) {
    return address.road;
  }

  return getCity(address);
}

function getLocationName(
  result: LocationSearchResult
): string {
  const address = result.address;

  if (!address) {
    return result.name?.trim() || "";
  }

  const city = getCity(address);

  const state =
    address.state?.trim() || "";

  if (
    city &&
    state &&
    city.toLowerCase() !==
      state.toLowerCase()
  ) {
    return `${city}, ${state}`;
  }

  return (
    city ||
    state ||
    result.name?.trim() ||
    ""
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LocationPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const draftId =
    searchParams.get("draftId");

  /*
   * Read the draft once when the component
   * initializes.
   *
   * We intentionally don't use an effect
   * to copy draft values into state.
   */
  const initialDraft =
    draftId
      ? getEventDraft(draftId)
      : null;

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [
    location,
    setLocation,
  ] = useState(
    initialDraft?.location || ""
  );

  const [
    venue,
    setVenue,
  ] = useState(
    initialDraft?.venue || ""
  );

  const [
    address,
    setAddress,
  ] = useState(
    initialDraft?.address || ""
  );

  const [
    date,
    setDate,
  ] = useState(
    initialDraft?.date || ""
  );

  const [
    startTime,
    setStartTime,
  ] = useState(
    initialDraft?.startTime ||
      initialDraft?.time ||
      ""
  );

  const [
    endTime,
    setEndTime,
  ] = useState(
    initialDraft?.endTime || ""
  );

  const [
    latitude,
    setLatitude,
  ] = useState<
    number | undefined
  >(
    initialDraft?.latitude
  );

  const [
    longitude,
    setLongitude,
  ] = useState<
    number | undefined
  >(
    initialDraft?.longitude
  );

  /* =======================================================
     SEARCH STATE
  ======================================================= */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState(
    initialDraft?.venue ||
      initialDraft?.location ||
      ""
  );

  const [
    searchResults,
    setSearchResults,
  ] = useState<
    LocationSearchResult[]
  >([]);

  const [
    isSearching,
    setIsSearching,
  ] = useState(false);

  const [
    showResults,
    setShowResults,
  ] = useState(false);

  const [
    searchError,
    setSearchError,
  ] = useState("");

  /* =======================================================
     VALIDATION
  ======================================================= */

  const [
    errors,
    setErrors,
  ] = useState<{
    location?: string;
    venue?: string;
    address?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    general?: string;
  }>({});

  /* =======================================================
     LOCATION SEARCH
     
     OpenStreetMap Nominatim
     
     No Google API key.
  ======================================================= */

  useEffect(() => {
    const query =
      searchQuery.trim();

    if (query.length < 3) {
      return;
    }

    let cancelled = false;

    const timeout =
      window.setTimeout(
        async () => {
          try {
            setIsSearching(true);
            setSearchError("");

            const url =
              `https://nominatim.openstreetmap.org/search?` +
              new URLSearchParams({
                q: query,
                format: "jsonv2",
                addressdetails: "1",
                limit: "5",
                countrycodes: "ng",
              }).toString();

            const response =
              await fetch(url, {
                headers: {
                  Accept:
                    "application/json",
                },
              });

            if (!response.ok) {
              throw new Error(
                "Location search failed."
              );
            }

            const data =
              (await response.json()) as LocationSearchResult[];

            if (cancelled) {
              return;
            }

            setSearchResults(data);
            setShowResults(true);
          } catch (error) {
            if (cancelled) {
              return;
            }

            console.error(
              "TEEKET location search error:",
              error
            );

            setSearchResults([]);
            setSearchError(
              "Unable to search locations right now."
            );
          } finally {
            if (!cancelled) {
              setIsSearching(false);
            }
          }
        },
        450
      );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timeout
      );
    };
  }, [searchQuery]);

  /* =======================================================
     SELECT LOCATION
  ======================================================= */

  const handleSelectLocation = (
    result: LocationSearchResult
  ) => {
    const lat =
      Number(result.lat);

    const lng =
      Number(result.lon);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      setSearchError(
        "This location does not have valid map coordinates."
      );

      return;
    }

    const selectedLocation =
      getLocationName(result);

    const selectedVenue =
      getVenueName(result);

    const selectedAddress =
      result.display_name;

    /*
     * Automatically fill the form.
     */

    setSearchQuery(
      selectedVenue ||
        selectedLocation ||
        result.display_name
    );

    setLocation(
      selectedLocation ||
        result.display_name
    );

    setVenue(
      selectedVenue ||
        selectedLocation ||
        result.display_name
    );

    setAddress(
      selectedAddress
    );

    setLatitude(lat);
    setLongitude(lng);

    /*
     * Hide suggestions after
     * selecting a location.
     */

    setSearchResults([]);
    setShowResults(false);
    setSearchError("");

    setErrors(
      (current) => ({
        ...current,
        location: undefined,
        venue: undefined,
        address: undefined,
      })
    );
  };

  /* =======================================================
     MAP LOCATION CHANGE
  ======================================================= */

  const handleMapLocationChange = (
    nextLatitude: number,
    nextLongitude: number
  ) => {
    setLatitude(nextLatitude);
    setLongitude(nextLongitude);
  };

  /* =======================================================
     SAVE LOCATION
  ======================================================= */

  const saveLocation = () => {
    if (!draftId) {
      return null;
    }

    return saveEventDraft({
      id: draftId,

      location:
        location.trim(),

      venue:
        venue.trim(),

      address:
        address.trim(),

      date,

      time:
        startTime,

      startTime,

      endTime,

      latitude,

      longitude,

      currentStep:
        "location",

      status:
        "draft",
    });
  };

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validate =
    () => {
      const next: {
        location?: string;
        venue?: string;
        address?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
      } = {};

      if (
        !location.trim()
      ) {
        next.location =
          "Location is required.";
      }

      if (
        !venue.trim()
      ) {
        next.venue =
          "Venue is required.";
      }

      if (
        !address.trim()
      ) {
        next.address =
          "Address is required.";
      }

      if (!date) {
        next.date =
          "Event date is required.";
      }

      if (!startTime) {
        next.startTime =
          "Start time is required.";
      }

      if (!endTime) {
        next.endTime =
          "End time is required.";
      }

      if (
        startTime &&
        endTime &&
        endTime <= startTime
      ) {
        next.endTime =
          "End time must be after start time.";
      }

      setErrors(next);

      return (
        Object.keys(next)
          .length === 0
      );
    };

  /* =======================================================
     CONTINUE
  ======================================================= */

  const handleContinue =
    () => {
      if (!draftId) {
        setErrors({
          general:
            "Event draft could not be found.",
        });

        return;
      }

      if (!validate()) {
        return;
      }

      const saved =
        saveLocation();

      if (!saved) {
        setErrors({
          general:
            "Unable to save event location.",
        });

        return;
      }

      router.push(
        `/dashboard/create-event/tickets?draftId=${encodeURIComponent(
          saved.id
        )}`
      );
    };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack =
    () => {
      if (draftId) {
        router.push(
          `/dashboard/create-event?draftId=${encodeURIComponent(
            draftId
          )}`
        );
      } else {
        router.push(
          "/dashboard/create-event"
        );
      }
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616] transition hover:bg-[#432616] hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
              Location & Time
            </h1>

            <p className="mt-2 text-gray-500">
              Search for your venue and set when
              your event will take place.
            </p>
          </div>
        </div>

        {/* =================================================
            FORM CARD
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">

          {/* =================================================
              SEARCH VENUE
          ================================================= */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#241507]">
              Search venue or location
            </label>

            <div className="relative">
              <Search
                size={19}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setSearchQuery(value);

                  setSearchError("");

                  setShowResults(
                    value.trim()
                      .length >= 3
                  );
                }}
                onFocus={() => {
                  if (
                    searchResults.length >
                    0
                  ) {
                    setShowResults(
                      true
                    );
                  }
                }}
                placeholder="Search venue, area or city..."
                className="h-14 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-12 text-sm text-[#241507] outline-none transition placeholder:text-gray-400 focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
              />

              {isSearching && (
                <Loader2
                  size={19}
                  className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#432616]"
                />
              )}
            </div>

            {/* =================================================
                SEARCH ERROR
            ================================================= */}

            {searchError && (
              <p className="mt-2 text-sm text-red-600">
                {searchError}
              </p>
            )}

            {/* =================================================
                SEARCH RESULTS
            ================================================= */}

            {showResults &&
              searchResults.length >
                0 && (
                <div className="relative z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  {searchResults.map(
                    (result) => (
                      <button
                        key={
                          result.place_id
                        }
                        type="button"
                        onClick={() =>
                          handleSelectLocation(
                            result
                          )
                        }
                        className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-4 text-left transition last:border-0 hover:bg-[#FAF8F6]"
                      >
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#432616]/10">
                          <MapPin
                            size={18}
                            className="text-[#432616]"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-[#241507]">
                            {result.name ||
                              getCity(
                                result.address
                              ) ||
                              "Location"}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-500">
                            {
                              result.display_name
                            }
                          </p>
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}

            {/* =================================================
                NO RESULTS
            ================================================= */}

            {showResults &&
              !isSearching &&
              searchQuery.trim()
                .length >= 3 &&
              searchResults.length ===
                0 &&
              !searchError && (
                <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                  No locations found. Try
                  searching for another venue,
                  area or city.
                </div>
              )}

            {/* =================================================
                MAP
            ================================================= */}

            <div className="mt-6">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-[#241507]">
                    Map location
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Select a search result to
                    position your event on the
                    map.
                  </p>
                </div>

                {latitude !==
                    undefined &&
                  longitude !==
                    undefined && (
                    <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                      <Check
                        size={14}
                      />

                      Selected
                    </div>
                  )}
              </div>

              {latitude !==
                  undefined &&
                longitude !==
                  undefined ? (
                <EventLocationMap
                  latitude={
                    latitude
                  }
                  longitude={
                    longitude
                  }
                  onLocationChange={
                    handleMapLocationChange
                  }
                />
              ) : (
                <div className="flex h-[360px] w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-[#F5F3F1]">
                  <div className="px-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#432616]/10">
                      <MapPin
                        size={26}
                        className="text-[#432616]"
                      />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#241507]">
                      Search for your
                      location
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                      Search for a venue,
                      area or city above
                      and select a result
                      to display it on the
                      map.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="my-8 border-t border-gray-100" />

          {/* =================================================
              LOCATION DETAILS
          ================================================= */}

          <div className="grid gap-5 md:grid-cols-2">

            {/* =================================================
                LOCATION
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#241507]">
                Location
              </label>

              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={location}
                  onChange={(event) => {
                    setLocation(
                      event.target.value
                    );

                    setErrors(
                      (current) => ({
                        ...current,
                        location:
                          undefined,
                      })
                    );
                  }}
                  placeholder="Lagos"
                  className={`h-14 w-full rounded-xl border bg-white pl-11 pr-4 outline-none transition ${
                    errors.location
                      ? "border-red-400"
                      : "border-gray-300 focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
                  }`}
                />
              </div>

              {errors.location && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.location}
                </p>
              )}
            </div>

            {/* =================================================
                VENUE
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#241507]">
                Venue
              </label>

              <input
                value={venue}
                onChange={(event) => {
                  setVenue(
                    event.target.value
                  );

                  setErrors(
                    (current) => ({
                      ...current,
                      venue:
                        undefined,
                    })
                  );
                }}
                placeholder="Landmark Beach"
                className={`h-14 w-full rounded-xl border bg-white px-4 outline-none transition ${
                  errors.venue
                    ? "border-red-400"
                    : "border-gray-300 focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
                }`}
              />

              {errors.venue && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.venue}
                </p>
              )}
            </div>

            {/* =================================================
                ADDRESS
            ================================================= */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#241507]">
                Detailed address
              </label>

              <input
                value={address}
                onChange={(event) => {
                  setAddress(
                    event.target.value
                  );

                  setErrors(
                    (current) => ({
                      ...current,
                      address:
                        undefined,
                    })
                  );
                }}
                placeholder="Victoria Island, Lagos"
                className={`h-14 w-full rounded-xl border bg-white px-4 outline-none transition ${
                  errors.address
                    ? "border-red-400"
                    : "border-gray-300 focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
                }`}
              />

              {errors.address && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.address}
                </p>
              )}
            </div>

            {/* =================================================
                DATE
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#241507]">
                Event date
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(
                      event.target.value
                    );

                    setErrors(
                      (current) => ({
                        ...current,
                        date:
                          undefined,
                      })
                    );
                  }}
                  className={`h-14 w-full rounded-xl border bg-white pl-11 pr-4 outline-none transition ${
                    errors.date
                      ? "border-red-400"
                      : "border-gray-300 focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
                  }`}
                />
              </div>

              {errors.date && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.date}
                </p>
              )}
            </div>

            {/* =================================================
                START TIME
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#241507]">
                Start time
              </label>

              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => {
                    setStartTime(
                      event.target.value
                    );

                    setErrors(
                      (current) => ({
                        ...current,
                        startTime:
                          undefined,
                      })
                    );
                  }}
                  className={`h-14 w-full rounded-xl border bg-white pl-11 pr-4 outline-none transition ${
                    errors.startTime
                      ? "border-red-400"
                      : "border-gray-300 focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
                  }`}
                />
              </div>

              {errors.startTime && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.startTime}
                </p>
              )}
            </div>

            {/* =================================================
                END TIME
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#241507]">
                End time
              </label>

              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => {
                    setEndTime(
                      event.target.value
                    );

                    setErrors(
                      (current) => ({
                        ...current,
                        endTime:
                          undefined,
                      })
                    );
                  }}
                  className={`h-14 w-full rounded-xl border bg-white pl-11 pr-4 outline-none transition ${
                    errors.endTime
                      ? "border-red-400"
                      : "border-gray-300 focus:border-[#432616] focus:ring-2 focus:ring-[#432616]/10"
                  }`}
                />
              </div>

              {errors.endTime && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>

          {/* =================================================
              GENERAL ERROR
          ================================================= */}

          {errors.general && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {errors.general}
              </p>
            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">

            <button
              type="button"
              onClick={handleBack}
              className="flex h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white transition hover:bg-[#321b0f]"
            >
              Continue

              <ArrowRight
                size={18}
              />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}