"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  getEventDraft,
  saveEventDraft,
} from "@/lib/dashboard/eventDraft";

export default function LocationPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const draftId =
    searchParams.get(
      "draftId"
    );

  const draft =
    draftId
      ? getEventDraft(
          draftId
        )
      : null;

  const [
    location,
    setLocation,
  ] = useState(
    draft?.location ??
      ""
  );

  const [
    venue,
    setVenue,
  ] = useState(
    draft?.venue ??
      draft?.location ??
      ""
  );

  const [
    address,
    setAddress,
  ] = useState(
    draft?.address ??
      ""
  );

  const [
    date,
    setDate,
  ] = useState(
    draft?.date ??
      ""
  );

  const [
    startTime,
    setStartTime,
  ] = useState(
    draft?.startTime ??
      draft?.time ??
      ""
  );

  const [
    endTime,
    setEndTime,
  ] = useState(
    draft?.endTime ??
      ""
  );

  const [
    latitude,
    setLatitude,
  ] = useState<
    number | undefined
  >(
    draft?.latitude
  );

  const [
    longitude,
    setLongitude,
  ] = useState<
    number | undefined
  >(
    draft?.longitude
  );

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

  const validate =
    () => {
      const next:
        typeof errors =
        {};

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
        endTime <=
          startTime
      ) {
        next.endTime =
          "End time must be after start time.";
      }

      setErrors(
        next
      );

      return (
        Object.keys(
          next
        ).length === 0
      );
    };

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

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">

        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616]"
          >
            <ArrowLeft
              size={20}
            />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
              Location & Time
            </h1>

            <p className="mt-2 text-gray-500">
              Set where and when your event will take place.
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">

          <div className="grid gap-5 md:grid-cols-2">

            {/* LOCATION */}

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
                  className={`h-14 w-full rounded-xl border bg-white pl-11 pr-4 outline-none ${
                    errors.location
                      ? "border-red-400"
                      : "border-gray-300 focus:border-[#432616]"
                  }`}
                />
              </div>

              {errors.location && (
                <p className="mt-2 text-sm text-red-600">
                  {
                    errors.location
                  }
                </p>
              )}
            </div>

            {/* VENUE */}

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
                className={`h-14 w-full rounded-xl border px-4 outline-none ${
                  errors.venue
                    ? "border-red-400"
                    : "border-gray-300 focus:border-[#432616]"
                }`}
              />

              {errors.venue && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.venue}
                </p>
              )}
            </div>

            {/* ADDRESS */}

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
                className={`h-14 w-full rounded-xl border px-4 outline-none ${
                  errors.address
                    ? "border-red-400"
                    : "border-gray-300 focus:border-[#432616]"
                }`}
              />

              {errors.address && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.address}
                </p>
              )}
            </div>

            {/* DATE */}

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
                  className={`h-14 w-full rounded-xl border bg-white pl-11 pr-4 outline-none ${
                    errors.date
                      ? "border-red-400"
                      : "border-gray-300 focus:border-[#432616]"
                  }`}
                />
              </div>

              {errors.date && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.date}
                </p>
              )}
            </div>

            {/* START TIME */}

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
                  className={`h-14 w-full rounded-xl border bg-white pl-11 pr-4 outline-none ${
                    errors.startTime
                      ? "border-red-400"
                      : "border-gray-300 focus:border-[#432616]"
                  }`}
                />
              </div>

              {errors.startTime && (
                <p className="mt-2 text-sm text-red-600">
                  {
                    errors.startTime
                  }
                </p>
              )}
            </div>

            {/* END TIME */}

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
                  className={`h-14 w-full rounded-xl border bg-white pl-11 pr-4 outline-none ${
                    errors.endTime
                      ? "border-red-400"
                      : "border-gray-300 focus:border-[#432616]"
                  }`}
                />
              </div>

              {errors.endTime && (
                <p className="mt-2 text-sm text-red-600">
                  {
                    errors.endTime
                  }
                </p>
              )}
            </div>

          </div>

          {errors.general && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {errors.general}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">

            <button
              type="button"
              onClick={handleBack}
              className="flex h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 font-medium text-gray-700"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white"
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