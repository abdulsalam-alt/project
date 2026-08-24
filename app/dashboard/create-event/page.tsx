"use client";

import {
  ArrowRight,
  ImagePlus,
  Save,
  Upload,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useState,
  useSyncExternalStore,
} from "react";

import {
  getEventDraft,
  saveEventDraft,
  subscribeToEventDrafts,
  type EventCategory,
  type EventDraft,
} from "@/lib/dashboard/eventDraft";

/* =========================================================
   CATEGORIES
========================================================= */

const categories: {
  value: EventCategory;
  label: string;
}[] = [
  {
    value: "community",
    label: "Community",
  },
  {
    value: "art-culture",
    label: "Art & Culture",
  },
  {
    value: "sport-wellness",
    label: "Sport & Wellness",
  },
  {
    value: "career-business",
    label: "Career & Business",
  },
  {
    value: "concerts",
    label: "Concerts",
  },
  {
    value: "food-drinks",
    label: "Food & Drinks",
  },
  {
    value: "spirituality-religion",
    label: "Spirituality & Religion",
  },
  {
    value: "night-life",
    label: "Night Life",
  },
];

/* =========================================================
   SERVER SNAPSHOT
========================================================= */

const EMPTY_DRAFT: EventDraft | null = null;

function serverDraftSnapshot(): EventDraft | null {
  return EMPTY_DRAFT;
}

/* =========================================================
   CREATE EMPTY DRAFT DATA
========================================================= */

function createEmptyDraftData(): EventDraft {
  const timestamp = new Date().toISOString();

  return {
    id: "",
    slug: "",
    title: "",
    description: "",
    image: undefined,
    organizerImage: undefined,

    category: "community",

    date: "",
    time: "",
    startTime: "",
    endTime: "",

    location: "",
    venue: "",
    address: "",

    latitude: undefined,
    longitude: undefined,

    organizer: {
      id: "current-organizer",
      name: "Organizer",
      image: "",
    },

    organizerId: "",
    organizerEmail: "",

    tickets: [],

    status: "draft",

    rejectionReason: undefined,

    createdAt: timestamp,
    updatedAt: timestamp,

    submittedAt: undefined,
    publishedAt: undefined,
    endedAt: undefined,
    cancelledAt: undefined,
  };
}

/* =========================================================
   MERGE DRAFT
========================================================= */

function createDraftFromExisting(
  draft: EventDraft | null
): EventDraft {
  if (draft) {
    return {
      ...createEmptyDraftData(),
      ...draft,

      organizer:
        draft.organizer ??
        {
          id:
            draft.organizerId ||
            "current-organizer",
          name: "Organizer",
          image:
            draft.organizerImage || "",
        },

      tickets:
        Array.isArray(draft.tickets)
          ? draft.tickets
          : [],
    };
  }

  return createEmptyDraftData();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CreateEventPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const draftId =
    searchParams.get("draftId");

  /* =======================================================
     LOAD DRAFT FROM EXTERNAL STORE
  ======================================================= */

  const draft =
    useSyncExternalStore(
      subscribeToEventDrafts,

      () =>
        draftId
          ? getEventDraft(draftId)
          : null,

      serverDraftSnapshot
    );

  /* =======================================================
     FORM STATE

     We intentionally do NOT use useEffect here.
     This prevents the React 19 cascading setState error.
  ======================================================= */

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState<EventCategory | "">("");

  const [image, setImage] =
    useState("");

  const [
    initializedDraftId,
    setInitializedDraftId,
  ] = useState<string | null>(null);

  /*
   * Initialize the form when the draft becomes available.
   *
   * This is deliberately guarded so it only happens once
   * for a specific draft.
   */
  if (
    draft &&
    initializedDraftId !== draft.id
  ) {
    setInitializedDraftId(draft.id);

    setTitle(draft.title || "");

    setDescription(
      draft.description || ""
    );

    setCategory(
      draft.category || ""
    );

    setImage(draft.image || "");
  }

  /* =======================================================
     ERRORS
  ======================================================= */

  const [errors, setErrors] =
    useState<{
      title?: string;
      description?: string;
      category?: string;
      image?: string;
    }>({});

  const [saving, setSaving] =
    useState(false);

  /* =======================================================
     SAVE EVENT
  ======================================================= */

  const buildEvent = (): EventDraft => {
    const baseDraft =
      createDraftFromExisting(draft);

    return {
      ...baseDraft,

      /*
       * Keep existing ID when editing.
       * Create a temporary ID when creating a new event.
       */
      id:
        baseDraft.id ||
        `event-${Date.now()}`,

      slug:
        baseDraft.slug ||
        createSlug(
          title.trim() ||
            "untitled-event"
        ),

      title: title.trim(),

      description:
        description.trim(),

      category:
        category ||
        "community",

      image:
        image || undefined,

      status: "draft",

      updatedAt:
        new Date().toISOString(),
    };
  };

  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  const saveDraft = () => {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const event =
        buildEvent();

      const saved =
        saveEventDraft(event);

      router.push(
        `/dashboard/events?draftSaved=${encodeURIComponent(
          saved.id
        )}`
      );
    } catch (error) {
      console.error(
        "TEEKET: Failed to save draft.",
        error
      );

      setSaving(false);
    }
  };

  /* =======================================================
     IMAGE
  ======================================================= */

  const handleImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      setErrors((current) => ({
        ...current,
        image:
          "Please select a valid image.",
      }));

      return;
    }

    /*
     * Keep uploads below the storage limit.
     *
     * Your eventDraft store already protects
     * localStorage, but 1MB is safer than 5MB
     * for a localStorage-backed MVP.
     */
    if (
      file.size >
      1024 * 1024
    ) {
      setErrors((current) => ({
        ...current,
        image:
          "Image must be less than 1MB.",
      }));

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setImage(
        String(reader.result)
      );

      setErrors((current) => ({
        ...current,
        image: undefined,
      }));
    };

    reader.onerror = () => {
      setErrors((current) => ({
        ...current,
        image:
          "Unable to read this image.",
      }));
    };

    reader.readAsDataURL(file);
  };

  /* =======================================================
     CONTINUE
  ======================================================= */

  const handleContinue = () => {
    if (saving) {
      return;
    }

    const nextErrors: {
      title?: string;
      description?: string;
      category?: string;
      image?: string;
    } = {};

    if (!title.trim()) {
      nextErrors.title =
        "Event title is required.";
    }

    if (!description.trim()) {
      nextErrors.description =
        "Event description is required.";
    }

    if (!category) {
      nextErrors.category =
        "Please select an event category.";
    }

    if (!image) {
      nextErrors.image =
        "Event image is required.";
    }

    setErrors(nextErrors);

    if (
      Object.keys(nextErrors)
        .length > 0
    ) {
      return;
    }

    setSaving(true);

    try {
      const event =
        buildEvent();

      const saved =
        saveEventDraft({
          ...event,

          currentStep: "location",
        } as EventDraft);

      /*
       * IMPORTANT:
       *
       * Your actual route must exist:
       *
       * app/dashboard/create-event/location/page.tsx
       *
       * NOT:
       *
       * app/dashboard/organizer/create-event/location/
       */

      router.push(
        `/dashboard/create-event/location?draftId=${encodeURIComponent(
          saved.id
        )}`
      );
    } catch (error) {
      console.error(
        "TEEKET: Failed to continue event creation.",
        error
      );

      setSaving(false);
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div>
          <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
            Create Event
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Start by telling attendees
            about your event.
          </p>
        </div>

        {/* FORM */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">

          {/* =================================================
              EVENT IMAGE
          ================================================= */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#241507]">
              Event image
            </label>

            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImage}
                disabled={saving}
                className="hidden"
              />

              {image ? (
                <div className="relative overflow-hidden rounded-2xl border border-gray-200">
                  <img
                    src={image}
                    alt={
                      title ||
                      "Event preview"
                    }
                    className="h-56 w-full object-cover sm:h-72"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition hover:opacity-100">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-[#432616]">
                      <Upload
                        size={18}
                      />

                      Change image
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center transition hover:border-[#432616]">
                  <ImagePlus
                    size={38}
                    className="text-gray-400"
                  />

                  <p className="mt-4 font-medium text-[#241507]">
                    Upload event image
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    PNG, JPG or WEBP · Max
                    1MB
                  </p>
                </div>
              )}
            </label>

            {errors.image && (
              <p className="mt-2 text-sm text-red-600">
                {errors.image}
              </p>
            )}
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <div className="mt-6">
            <label
              htmlFor="event-title"
              className="mb-2 block text-sm font-semibold text-[#241507]"
            >
              Event title
            </label>

            <input
              id="event-title"
              value={title}
              onChange={(event) => {
                setTitle(
                  event.target.value
                );

                setErrors((current) => ({
                  ...current,
                  title: undefined,
                }));
              }}
              placeholder="e.g. Afrofusion 2026"
              disabled={saving}
              className={`h-14 w-full rounded-xl border bg-white px-4 outline-none transition ${
                errors.title
                  ? "border-red-400"
                  : "border-gray-300 focus:border-[#432616]"
              } disabled:bg-gray-50`}
            />

            {errors.title && (
              <p className="mt-2 text-sm text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="mt-5">
            <label
              htmlFor="event-description"
              className="mb-2 block text-sm font-semibold text-[#241507]"
            >
              Description
            </label>

            <textarea
              id="event-description"
              value={description}
              onChange={(event) => {
                setDescription(
                  event.target.value
                );

                setErrors((current) => ({
                  ...current,
                  description:
                    undefined,
                }));
              }}
              rows={6}
              placeholder="Tell people what your event is about..."
              disabled={saving}
              className={`w-full resize-none rounded-xl border bg-white px-4 py-4 outline-none transition ${
                errors.description
                  ? "border-red-400"
                  : "border-gray-300 focus:border-[#432616]"
              } disabled:bg-gray-50`}
            />

            {errors.description && (
              <p className="mt-2 text-sm text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          {/* =================================================
              CATEGORY
          ================================================= */}

          <div className="mt-5">
            <label
              htmlFor="event-category"
              className="mb-2 block text-sm font-semibold text-[#241507]"
            >
              Category
            </label>

            <select
              id="event-category"
              value={category}
              onChange={(event) => {
                setCategory(
                  event.target
                    .value as EventCategory
                );

                setErrors((current) => ({
                  ...current,
                  category: undefined,
                }));
              }}
              disabled={saving}
              className={`h-14 w-full rounded-xl border bg-white px-4 outline-none transition ${
                errors.category
                  ? "border-red-400"
                  : "border-gray-300 focus:border-[#432616]"
              } disabled:bg-gray-50`}
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>

            {errors.category && (
              <p className="mt-2 text-sm text-red-600">
                {errors.category}
              </p>
            )}
          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">

            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#432616] bg-white px-6 font-semibold text-[#432616] transition hover:bg-[#432616]/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Continue"}

              {!saving && (
                <ArrowRight
                  size={18}
                />
              )}
            </button>

          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   SLUG
========================================================= */

function createSlug(
  title: string
): string {
  const slug =
    title
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );

  return (
    slug ||
    `event-${Date.now()}`
  );
}