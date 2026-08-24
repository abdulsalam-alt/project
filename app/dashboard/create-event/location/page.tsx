"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  MapPin,
  Search,
  Save,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  FormEvent,
  useState,
  useSyncExternalStore,
} from "react";

import {
  getEventDraft,
  saveEventDraft,
  subscribeToEventDrafts,
} from "@/lib/dashboard/eventDraft";

type SearchResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
};

function readySubscribe() {
  return () => {};
}

function clientReady() {
  return true;
}

function serverNotReady() {
  return false;
}

function getMapUrl(
  lat: number,
  lng: number
) {
  const delta = 0.025;

  const left = lng - delta;
  const right = lng + delta;
  const bottom = lat - delta;
  const top = lat + delta;

  return (
    "https://www.openstreetmap.org/export/embed.html" +
    `?bbox=${left}%2C${bottom}%2C${right}%2C${top}` +
    `&layer=mapnik` +
    `&marker=${lat}%2C${lng}`
  );
}

export default function LocationPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const draftId =
    searchParams.get("draftId");

  const ready =
    useSyncExternalStore(
      readySubscribe,
      clientReady,
      serverNotReady
    );

  const draft =
    useSyncExternalStore(
      subscribeToEventDrafts,
      () => getEventDraft(draftId),
      () => null
    );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState(
    () =>
      draft?.locationQuery ??
      draft?.location ??
      ""
  );

  const [
    location,
    setLocation,
  ] = useState(
    () => draft?.location ?? ""
  );

  const [
    address,
    setAddress,
  ] = useState(
    () => draft?.address ?? ""
  );

  const [date, setDate] =
    useState(
      () => draft?.date ?? ""
    );

  const [
    startTime,
    setStartTime,
  ] = useState(
    () => draft?.startTime ?? ""
  );

  const [
    endTime,
    setEndTime,
  ] = useState(
    () => draft?.endTime ?? ""
  );

  const [lat, setLat] =
    useState<number | null>(
      () => draft?.mapLat ?? null
    );

  const [lng, setLng] =
    useState<number | null>(
      () => draft?.mapLng ?? null
    );

  const [
    results,
    setResults,
  ] = useState<SearchResult[]>([]);

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const saveCurrentDraft = (
    step: "location" | "ticket-type"
  ) => {
    if (!draftId) {
      return null;
    }

    return saveEventDraft({
      id: draftId,

      location:
        location.trim(),

      venue:
        location.trim(),

      address:
        address.trim(),

      locationQuery:
        searchQuery.trim(),

      mapLat: lat,

      mapLng: lng,

      date,

      startTime,

      endTime,

      currentStep: step,

      status: "draft",
    });
  };

  const searchLocation = async (
    event?: FormEvent
  ) => {
    event?.preventDefault();

    const query =
      searchQuery.trim();

    if (!query) {
      setResults([]);
      return;
    }

    setSearching(true);
    setError("");

    try {
      const url =
        "https://nominatim.openstreetmap.org/search" +
        `?format=jsonv2` +
        `&addressdetails=1` +
        `&limit=6` +
        `&q=${encodeURIComponent(
          query
        )}`;

      const response =
        await fetch(url, {
          headers: {
            Accept:
              "application/json",
            "Accept-Language":
              "en",
          },
        });

      if (!response.ok) {
        throw new Error(
          "Location search failed."
        );
      }

      const data =
        (await response.json()) as SearchResult[];

      setResults(data);

      if (data.length === 0) {
        setError(
          "No location found. Try a different search."
        );
      }
    } catch {
      setError(
        "Unable to search location right now. You can still enter the venue and address manually."
      );
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = (
    result: SearchResult
  ) => {
    const selectedLat =
      Number(result.lat);

    const selectedLng =
      Number(result.lon);

    const selectedName =
      result.name?.trim() ||
      result.display_name
        .split(",")[0]
        .trim();

    setSearchQuery(
      result.display_name
    );

    setLocation(selectedName);

    setAddress(
      result.display_name
    );

    setLat(selectedLat);
    setLng(selectedLng);

    setResults([]);
    setError("");

    if (draftId) {
      saveEventDraft({
        id: draftId,

        location:
          selectedName,

        venue:
          selectedName,

        address:
          result.display_name,

        locationQuery:
          result.display_name,

        mapLat: selectedLat,

        mapLng: selectedLng,

        currentStep: "location",

        status: "draft",
      });
    }
  };

  const validate = () => {
    if (!location.trim()) {
      setError(
        "Venue / Location is required."
      );

      return false;
    }

    if (!address.trim()) {
      setError(
        "Please enter the full address."
      );

      return false;
    }

    if (!date) {
      setError(
        "Event date is required."
      );

      return false;
    }

    if (!startTime) {
      setError(
        "Start time is required."
      );

      return false;
    }

    if (!endTime) {
      setError(
        "End time is required."
      );

      return false;
    }

    if (endTime <= startTime) {
      setError(
        "End time must be after start time."
      );

      return false;
    }

    setError("");

    return true;
  };

  const handleSaveDraft = () => {
    if (!draftId) {
      setError(
        "Event draft could not be found."
      );

      return;
    }

    setSaving(true);

    saveCurrentDraft("location");

    setSaving(false);

    router.push(
      "/dashboard/events"
    );
  };

  const handleContinue = () => {
    if (!draftId) {
      setError(
        "Event draft could not be found."
      );

      return;
    }

    if (!validate()) {
      return;
    }

    setSaving(true);

    saveCurrentDraft(
      "ticket-type"
    );

    setSaving(false);

    router.push(
      `/dashboard/create-event/tickets?draftId=${encodeURIComponent(
        draftId
      )}`
    );
  };

  const handleBack = () => {
    if (draftId) {
      saveCurrentDraft("details");

      router.push(
        `/dashboard/create-event?draftId=${encodeURIComponent(
          draftId
        )}`
      );

      return;
    }

    router.push(
      "/dashboard/create-event"
    );
  };

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="mt-8 h-[700px] rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (!draftId || !draft) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] p-5">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-red-700">
            Event draft could not be
            found.
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Return to event creation and
            start or select a draft again.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/events"
              )
            }
            className="mt-5 rounded-xl bg-[#432616] px-5 py-3 font-semibold text-white"
          >
            Back to Events
          </button>
        </div>
      </main>
    );
  }

  const mapLat =
    lat ?? 6.5244;

  const mapLng =
    lng ?? 3.3792;

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616]"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
              Location & Time
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Tell attendees where and
              when your event will happen.
            </p>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="mt-7">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-2 rounded-full bg-[#432616]" />
            <div className="h-2 rounded-full bg-[#432616]" />
            <div className="h-2 rounded-full bg-gray-200" />
          </div>

          <div className="mt-3 grid grid-cols-3 text-xs sm:text-sm">
            <span className="text-left text-gray-400">
              Event Details
            </span>

            <span className="text-center font-semibold text-[#432616]">
              Location & Time
            </span>

            <span className="text-right text-gray-400">
              Tickets
            </span>
          </div>
        </div>

        {/* FORM */}

        <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">
          {/* SEARCH */}

          <form
            onSubmit={searchLocation}
          >
            <label className="mb-2 block text-sm font-semibold text-[#241507]">
              Search location
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search venue, street, area or city..."
                  className="h-14 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 outline-none focus:border-[#432616]"
                />
              </div>

              <button
                type="submit"
                disabled={searching}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#432616] px-6 font-semibold text-white disabled:opacity-50"
              >
                {searching ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Searching
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>

          {/* RESULTS */}

          {results.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {results.map(
                (result) => (
                  <button
                    key={
                      result.place_id
                    }
                    type="button"
                    onClick={() =>
                      selectLocation(
                        result
                      )
                    }
                    className="flex w-full items-start gap-3 border-b border-gray-100 p-4 text-left last:border-0 hover:bg-gray-50"
                  >
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-[#432616]"
                    />

                    <span className="text-sm text-gray-700">
                      {
                        result.display_name
                      }
                    </span>
                  </button>
                )
              )}
            </div>
          )}

          {/* MAP */}

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-[#241507]">
                Map
              </label>

              {lat !== null &&
                lng !== null && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                    <Check
                      size={14}
                    />
                    Location selected
                  </span>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <iframe
                title="Event location map"
                src={getMapUrl(
                  mapLat,
                  mapLng
                )}
                className="h-72 w-full sm:h-96"
                loading="lazy"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Search for a location above
              and select a result to move
              the map and automatically
              fill the location.
            </p>
          </div>

          {/* VENUE */}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-[#241507]">
              Venue / Location
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
                }}
                placeholder="e.g. Landmark Beach"
                className="h-14 w-full rounded-xl border border-gray-300 pl-11 pr-4 outline-none focus:border-[#432616]"
              />
            </div>
          </div>

          {/* ADDRESS */}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-[#241507]">
              Full Address
            </label>

            <input
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value
                )
              }
              placeholder="Enter the full address manually"
              className="h-14 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-[#432616]"
            />
          </div>

          {/* DATE */}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-[#241507]">
              Event Date
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
                className="h-14 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 outline-none focus:border-[#432616]"
              />
            </div>
          </div>

          {/* TIME */}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#241507]">
                Start Time
              </label>

              <div className="relative">
                <Clock3
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="time"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(
                      event.target.value
                    )
                  }
                  className="h-14 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 outline-none focus:border-[#432616]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#241507]">
                End Time
              </label>

              <div className="relative">
                <Clock3
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(
                      event.target.value
                    )
                  }
                  className="h-14 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 outline-none focus:border-[#432616]"
                />
              </div>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* FOOTER */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#432616] bg-white px-6 font-semibold text-[#432616]"
            >
              <Save size={18} />
              Save Draft
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="h-12 rounded-xl border border-gray-300 bg-white px-6 font-medium"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleContinue}
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white disabled:opacity-50"
              >
                Continue
                <ArrowRight
                  size={18}
                />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}