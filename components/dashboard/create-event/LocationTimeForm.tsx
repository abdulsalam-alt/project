"use client";

import dynamic from "next/dynamic";

import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import {
  useCallback,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  getEventDraft,
  saveEventDraft,
} from "@/lib/dashboard/event";

import type {
  EventDraftStep,
} from "@/lib/dashboard/event";

import type {
  SelectedLocation,
} from "./LeafletLocationPicker";

/* ============================================================================
   LEAFLET
============================================================================ */

const LeafletLocationPicker =
  dynamic(
    () =>
      import(
        "./LeafletLocationPicker"
      ),
    {
      ssr: false,

      loading: () => (
        <div className="flex h-[430px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Loading map...
          </div>
        </div>
      ),
    }
  );

/* ============================================================================
   PROPS
============================================================================ */

interface Props {
  draftId?: string | null;
}

/* ============================================================================
   COMPONENT
============================================================================ */

export default function LocationTimeForm({
  draftId,
}: Props) {
  const router = useRouter();

  /* --------------------------------------------------------------------------
     EXISTING DRAFT
  -------------------------------------------------------------------------- */

  const existingDraft =
    draftId
      ? getEventDraft(draftId)
      : null;

  /* --------------------------------------------------------------------------
     STATE
  -------------------------------------------------------------------------- */

  const [
    date,
    setDate,
  ] = useState(
    existingDraft?.date ?? ""
  );

  const [
    startTime,
    setStartTime,
  ] = useState(
    existingDraft?.startTime ?? ""
  );

  const [
    endTime,
    setEndTime,
  ] = useState(
    existingDraft?.endTime ?? ""
  );

  const [
    location,
    setLocation,
  ] =
    useState<SelectedLocation | null>(
      existingDraft
        ? {
            venue:
              existingDraft.venue ||
              existingDraft.location ||
              "",

            address:
              existingDraft.address ||
              "",

            latitude:
              existingDraft.latitude ??
              0,

            longitude:
              existingDraft.longitude ??
              0,
          }
        : null
    );

  const [
    errors,
    setErrors,
  ] = useState<
    Record<string, string>
  >({});

  /* --------------------------------------------------------------------------
     SAVE
  -------------------------------------------------------------------------- */

  const saveCurrentDraft =
    useCallback(
      (
        overrides?: {
          date?: string;
          startTime?: string;
          endTime?: string;
          location?:
            | SelectedLocation
            | null;
          currentStep?: EventDraftStep;
        }
      ) => {
        const currentDate =
          overrides?.date ??
          date;

        const currentStartTime =
          overrides?.startTime ??
          startTime;

        const currentEndTime =
          overrides?.endTime ??
          endTime;

        const currentLocation =
          overrides?.location !==
          undefined
            ? overrides.location
            : location;

        const currentStep =
          overrides?.currentStep ??
          "location";

        saveEventDraft({
          id:
            draftId ??
            undefined,

          date:
            currentDate,

          startTime:
            currentStartTime,

          endTime:
            currentEndTime,

          location:
            currentLocation?.venue ??
            "",

          venue:
            currentLocation?.venue ??
            "",

          address:
            currentLocation?.address ??
            "",

          latitude:
            currentLocation?.latitude ??
            null,

          longitude:
            currentLocation?.longitude ??
            null,

          currentStep,

          status: "draft",
        });
      },
      [
        draftId,
        date,
        startTime,
        endTime,
        location,
      ]
    );

  /* --------------------------------------------------------------------------
     ERROR
  -------------------------------------------------------------------------- */

  const removeError =
    useCallback(
      (field: string) => {
        setErrors(
          (previous) => {
            if (
              !previous[field]
            ) {
              return previous;
            }

            const next = {
              ...previous,
            };

            delete next[field];

            return next;
          }
        );
      },
      []
    );

  /* --------------------------------------------------------------------------
     DATE
  -------------------------------------------------------------------------- */

  const handleDateChange =
    (value: string) => {
      setDate(value);

      removeError("date");

      saveCurrentDraft({
        date: value,
      });
    };

  /* --------------------------------------------------------------------------
     START TIME
  -------------------------------------------------------------------------- */

  const handleStartTimeChange =
    (value: string) => {
      setStartTime(value);

      removeError("startTime");
      removeError("endTime");

      saveCurrentDraft({
        startTime: value,
      });
    };

  /* --------------------------------------------------------------------------
     END TIME
  -------------------------------------------------------------------------- */

  const handleEndTimeChange =
    (value: string) => {
      setEndTime(value);

      removeError("endTime");

      saveCurrentDraft({
        endTime: value,
      });
    };

  /* --------------------------------------------------------------------------
     LOCATION
  -------------------------------------------------------------------------- */

  const handleLocationChange =
    (
      selected: SelectedLocation
    ) => {
      setLocation(selected);

      removeError("location");

      saveCurrentDraft({
        location: selected,
      });
    };

  /* --------------------------------------------------------------------------
     VALIDATION
  -------------------------------------------------------------------------- */

  const validate = () => {
    const next: Record<
      string,
      string
    > = {};

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

    if (!location) {
      next.location =
        "Please select your event location.";
    }

    if (
      startTime &&
      endTime &&
      startTime >= endTime
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

  /* --------------------------------------------------------------------------
     CONTINUE
  -------------------------------------------------------------------------- */

  const handleContinue =
    () => {
      if (!validate()) {
        return;
      }

      if (!draftId) {
        return;
      }

      const saved =
        saveEventDraft({
          id: draftId,

          date,

          startTime,

          endTime,

          location:
            location?.venue ??
            "",

          venue:
            location?.venue ??
            "",

          address:
            location?.address ??
            "",

          latitude:
            location?.latitude ??
            null,

          longitude:
            location?.longitude ??
            null,

          currentStep:
            "ticket-type",

          status: "draft",
        });

      router.push(
        `/dashboard/create-event/tickets?draftId=${encodeURIComponent(
          saved.id
        )}`
      );
    };

  /* --------------------------------------------------------------------------
     BACK
  -------------------------------------------------------------------------- */

  const handleBack =
    () => {
      saveCurrentDraft({
        currentStep:
          "location",
      });

      router.push(
        draftId
          ? `/dashboard/create-event?draftId=${encodeURIComponent(
              draftId
            )}`
          : "/dashboard/create-event"
      );
    };

  /* --------------------------------------------------------------------------
     SAVE DRAFT
  -------------------------------------------------------------------------- */

  const handleSaveDraft =
    () => {
      const saved =
        saveEventDraft({
          id:
            draftId ??
            undefined,

          date,

          startTime,

          endTime,

          location:
            location?.venue ??
            "",

          venue:
            location?.venue ??
            "",

          address:
            location?.address ??
            "",

          latitude:
            location?.latitude ??
            null,

          longitude:
            location?.longitude ??
            null,

          currentStep:
            "location",

          status: "draft",
        });

      router.push(
        `/dashboard/events?draftId=${encodeURIComponent(
          saved.id
        )}`
      );
    };

  /* --------------------------------------------------------------------------
     SELECTED LOCATION
  -------------------------------------------------------------------------- */

  const selectedLocation =
    location
      ? {
          venue:
            location.venue,

          address:
            location.address,

          latitude:
            location.latitude,

          longitude:
            location.longitude,
        }
      : null;

  /* --------------------------------------------------------------------------
     NO DRAFT
  -------------------------------------------------------------------------- */

  if (
    draftId &&
    !existingDraft
  ) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-white p-6">
            <h1 className="text-xl font-semibold text-red-700">
              Event draft not found
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              This event draft could not
              be found. Please return to
              event creation.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/create-event"
                )
              }
              className="mt-5 h-11 rounded-xl bg-[#432616] px-5 font-semibold text-white"
            >
              Back to Event Creation
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* --------------------------------------------------------------------------
     UI
  -------------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}

        <div className="mb-8 flex items-start gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616] transition hover:bg-gray-50"
            aria-label="Go back"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-[#241507] sm:text-3xl">
              Location & Time
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Tell attendees where and
              when the event will happen.
            </p>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="mb-8">
          <div className="flex gap-2">
            <div className="h-2 flex-1 rounded-full bg-[#432616]" />

            <div className="h-2 flex-1 rounded-full bg-[#432616]" />

            <div className="h-2 flex-1 rounded-full bg-gray-200" />
          </div>

          <div className="mt-3 grid grid-cols-3 text-xs sm:text-sm">
            <span className="text-left text-gray-400">
              Event Details
            </span>

            <span className="text-center font-medium text-[#432616]">
              Location & Time
            </span>

            <span className="text-right text-gray-400">
              Tickets
            </span>
          </div>
        </div>

        {/* FORM */}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 md:p-8">
          <div className="space-y-7">
            {/* MAP + SEARCH */}

            <div>
              <LeafletLocationPicker
                value={
                  selectedLocation
                }
                onChange={
                  handleLocationChange
                }
              />

              {errors.location && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.location}
                </p>
              )}
            </div>

            {/* DATE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-[#241507]">
                Event Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  handleDateChange(
                    event.target.value
                  )
                }
                className={`h-14 w-full rounded-xl border bg-white px-4 outline-none ${
                  errors.date
                    ? "border-red-400"
                    : "border-gray-300 focus:border-[#432616]"
                }`}
              />

              {errors.date && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.date}
                </p>
              )}
            </div>

            {/* TIME */}

            <div className="grid gap-5 sm:grid-cols-2">
              {/* START */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#241507]">
                  Start Time
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(event) =>
                    handleStartTimeChange(
                      event.target.value
                    )
                  }
                  className={`h-14 w-full rounded-xl border bg-white px-4 outline-none ${
                    errors.startTime
                      ? "border-red-400"
                      : "border-gray-300 focus:border-[#432616]"
                  }`}
                />

                {errors.startTime && (
                  <p className="mt-2 text-sm text-red-600">
                    {
                      errors.startTime
                    }
                  </p>
                )}
              </div>

              {/* END */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#241507]">
                  End Time
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    handleEndTimeChange(
                      event.target.value
                    )
                  }
                  className={`h-14 w-full rounded-xl border bg-white px-4 outline-none ${
                    errors.endTime
                      ? "border-red-400"
                      : "border-gray-300 focus:border-[#432616]"
                  }`}
                />

                {errors.endTime && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.endTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={
                handleSaveDraft
              }
              className="h-12 rounded-xl border border-gray-300 bg-white px-6 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Save as Draft
            </button>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                onClick={
                  handleContinue
                }
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-8 font-semibold text-white transition hover:opacity-90"
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