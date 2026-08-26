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
  createEventDraft,
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
   TYPES
========================================================= */

interface CreateEventFormProps {
  draft: EventDraft | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  image?: string;
  general?: string;
}

/* =========================================================
   SSR HELPERS
========================================================= */

const EMPTY_DRAFT: EventDraft | null = null;

function subscribeReady(
  callback: () => void
): () => void {
  void callback;

  return () => {};
}

function getClientReady(): boolean {
  return true;
}

function getServerReady(): boolean {
  return false;
}

/* =========================================================
   CREATE EVENT FORM
========================================================= */

function CreateEventForm({
  draft,
}: CreateEventFormProps) {
  const router = useRouter();

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [title, setTitle] = useState<string>(
    draft?.title ?? ""
  );

  const [description, setDescription] =
    useState<string>(
      draft?.description ?? ""
    );

  const [category, setCategory] =
    useState<EventCategory | "">(
      draft?.category ?? ""
    );

  const [image, setImage] = useState<string>(
    draft?.image ?? ""
  );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [saving, setSaving] =
    useState(false);

  /* =======================================================
     CLEAR ERROR
  ======================================================= */

  const clearError = (
    field: keyof FormErrors
  ) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      general: undefined,
    }));
  };

  /* =======================================================
     SAVE FORM
  ======================================================= */

  const saveCurrentForm = (
    nextStep: "details" | "location"
  ): EventDraft => {
    const cleanTitle = title.trim();

    const cleanDescription =
      description.trim();

    /*
     * This should only be called after
     * validation when continuing.
     *
     * For drafts, we still allow an empty
     * category and title.
     */
    const selectedCategory =
      category || draft?.category;

    /* =====================================================
       UPDATE EXISTING DRAFT
    ===================================================== */

    if (draft?.id) {
      return saveEventDraft({
        id: draft.id,

        title: cleanTitle,

        description: cleanDescription,

        ...(selectedCategory
          ? {
              category:
                selectedCategory,
            }
          : {}),

        ...(image
          ? {
              image,
            }
          : {}),

        /*
         * Do NOT replace the existing
         * organizer information.
         *
         * eventDraft.ts will preserve
         * existing fields that are not
         * included here.
         */

        currentStep: nextStep,

        status:
          draft.status === "published"
            ? "published"
            : "draft",
      });
    }

    /* =====================================================
       CREATE NEW DRAFT
    ===================================================== */

    return createEventDraft({
      title: cleanTitle,

      description: cleanDescription,

      ...(selectedCategory
        ? {
            category:
              selectedCategory,
          }
        : {}),

      ...(image
        ? {
            image,
          }
        : {}),

      tickets: [],

      /*
       * IMPORTANT:
       *
       * Do not use:
       *
       * ticketType: ""
       *
       * because TicketType does not
       * accept an empty string.
       */

      currentStep: nextStep,

      status: "draft",
    });
  };

  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  const handleSaveDraft = () => {
    if (saving) {
      return;
    }

    setErrors({});

    setSaving(true);

    try {
      const saved =
        saveCurrentForm("details");

      router.push(
        `/dashboard/events?draftSaved=${encodeURIComponent(
          saved.id
        )}`
      );
    } catch (error) {
      console.error(
        "TEEKET: Failed to save event draft.",
        error
      );

      setErrors({
        general:
          "Unable to save this draft. Please try again.",
      });

      setSaving(false);
    }
  };
  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    clearError("image");

    /* -----------------------------------------------------
       FILE TYPE
    ----------------------------------------------------- */

    if (
      !file.type.startsWith("image/")
    ) {
      setErrors((current) => ({
        ...current,
        image:
          "Please select a valid image.",
      }));

      event.target.value = "";

      return;
    }

    /* -----------------------------------------------------
       FILE SIZE
    ----------------------------------------------------- */

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setErrors((current) => ({
        ...current,
        image:
          "Image must be less than 5MB.",
      }));

      event.target.value = "";

      return;
    }

    /* -----------------------------------------------------
       READ FILE
    ----------------------------------------------------- */

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        typeof reader.result ===
        "string"
          ? reader.result
          : "";

      if (!result) {
        setErrors((current) => ({
          ...current,
          image:
            "Unable to read the selected image.",
        }));

        return;
      }

      /* ---------------------------------------------------
         COMPRESS IMAGE BEFORE STORAGE
      --------------------------------------------------- */

      const img =
        new Image();

      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1200;

        let width =
          img.width;

        let height =
          img.height;

        if (
          width >
            maxWidth ||
          height >
            maxHeight
        ) {
          const widthRatio =
            maxWidth /
            width;

          const heightRatio =
            maxHeight /
            height;

          const ratio =
            Math.min(
              widthRatio,
              heightRatio
            );

          width =
            Math.round(
              width * ratio
            );

          height =
            Math.round(
              height * ratio
            );
        }

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          width;

        canvas.height =
          height;

        const context =
          canvas.getContext(
            "2d"
          );

        if (!context) {
          setErrors((current) => ({
            ...current,
            image:
              "Unable to process the selected image.",
          }));

          return;
        }

        context.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        const compressedImage =
          canvas.toDataURL(
            "image/jpeg",
            0.75
          );

        setImage(
          compressedImage
        );

        clearError("image");
      };

      img.onerror = () => {
        setErrors((current) => ({
          ...current,
          image:
            "Unable to process the selected image.",
        }));
      };

      img.src = result;
    };

    reader.onerror = () => {
      setErrors((current) => ({
        ...current,
        image:
          "Unable to read the selected image.",
      }));
    };

    reader.readAsDataURL(file);
  };

  /* =======================================================
     CATEGORY
  ======================================================= */

  const handleCategoryChange = (
    value: string
  ) => {
    if (!value) {
      setCategory("");

      clearError("category");

      return;
    }

    const selected =
      categories.find(
        (item) =>
          item.value === value
      );

    if (!selected) {
      return;
    }

    setCategory(
      selected.value
    );

    clearError("category");
  };

  /* =======================================================
     CONTINUE VALIDATION
  ======================================================= */

  const validateForm = (): boolean => {
    const nextErrors:
      FormErrors = {};

    const cleanTitle =
      title.trim();

    const cleanDescription =
      description.trim();

    /* -----------------------------------------------------
       TITLE
    ----------------------------------------------------- */

    if (!cleanTitle) {
      nextErrors.title =
        "Event title is required.";
    } else if (
      cleanTitle.length < 3
    ) {
      nextErrors.title =
        "Event title must be at least 3 characters.";
    }

    /* -----------------------------------------------------
       DESCRIPTION
    ----------------------------------------------------- */

    if (!cleanDescription) {
      nextErrors.description =
        "Event description is required.";
    } else if (
      cleanDescription.length <
      10
    ) {
      nextErrors.description =
        "Please provide a little more information about your event.";
    }

    /* -----------------------------------------------------
       CATEGORY
    ----------------------------------------------------- */

    if (!category) {
      nextErrors.category =
        "Please select an event category.";
    }

    /* -----------------------------------------------------
       IMAGE
    ----------------------------------------------------- */

    if (!image) {
      nextErrors.image =
        "Event image is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  /* =======================================================
     CONTINUE
  ======================================================= */

  const handleContinue = () => {
    if (saving) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      /*
       * Save the current details and
       * move the SAME draft to location.
       */
      const saved =
        saveCurrentForm("location");

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

      setErrors({
        general:
          "Unable to continue event creation. Please try again.",
      });

      setSaving(false);
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

        <div>
          <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
            Create Event
          </h1>

          <p className="mt-2 text-gray-500">
            Start by telling attendees
            about your event.
          </p>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">

          {/* =================================================
              IMAGE
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
                className="hidden"
              />

              {image ? (
                <div className="group relative overflow-hidden rounded-2xl border border-gray-200">
                  <img
                    src={image}
                    alt="Event preview"
                    className="h-56 w-full object-cover sm:h-72"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-[#432616]">
                      <Upload size={18} />
                      Change image
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 text-center transition hover:border-[#432616]">
                  <ImagePlus
                    size={38}
                    className="text-gray-400"
                  />

                  <p className="mt-4 font-medium text-[#241507]">
                    Upload event image
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    PNG, JPG or WEBP · Max 5MB
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
              type="text"
              value={title}
              maxLength={120}
              onChange={(event) => {
                setTitle(
                  event.target.value
                );

                clearError("title");
              }}
              placeholder="e.g. Afrofusion 2026"
              className={`h-14 w-full rounded-xl border px-4 outline-none transition ${
                errors.title
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-[#432616]"
              }`}
            />

            <div className="mt-1 flex justify-between">
              {errors.title ? (
                <p className="text-sm text-red-600">
                  {errors.title}
                </p>
              ) : (
                <span />
              )}

              <span className="text-xs text-gray-400">
                {title.length}/120
              </span>
            </div>
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
              maxLength={2000}
              onChange={(event) => {
                setDescription(
                  event.target.value
                );

                clearError(
                  "description"
                );
              }}
              rows={6}
              placeholder="Tell people what your event is about..."
              className={`w-full resize-none rounded-xl border px-4 py-4 outline-none transition ${
                errors.description
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-[#432616]"
              }`}
            />

            <div className="mt-1 flex justify-between">
              {errors.description ? (
                <p className="text-sm text-red-600">
                  {errors.description}
                </p>
              ) : (
                <span />
              )}

              <span className="text-xs text-gray-400">
                {description.length}/2000
              </span>
            </div>
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
              onChange={(event) =>
                handleCategoryChange(
                  event.target.value
                )
              }
              className={`h-14 w-full rounded-xl border bg-white px-4 outline-none transition ${
                errors.category
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-[#432616]"
              }`}
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
              GENERAL ERROR
          ================================================= */}

          {errors.general && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {errors.general}
              </p>
            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

            <button
              type="button"
              onClick={
                handleSaveDraft
              }
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
              onClick={
                handleContinue
              }
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
   PAGE
========================================================= */

export default function CreateEventPage() {
  const searchParams =
    useSearchParams();

  const draftId =
    searchParams.get(
      "draftId"
    );

  const ready =
    useSyncExternalStore(
      subscribeReady,
      getClientReady,
      getServerReady
    );

  const draft =
    useSyncExternalStore(
      subscribeToEventDrafts,
      () =>
        draftId
          ? getEventDraft(
              draftId
            )
          : EMPTY_DRAFT,
      () => EMPTY_DRAFT
    );

  /* =======================================================
     LOADING
  ======================================================= */

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200" />

          <div className="mt-3 h-5 w-72 rounded bg-gray-200" />

          <div className="mt-8 h-[650px] rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  /* =======================================================
     DRAFT NOT FOUND
  ======================================================= */

  if (draftId && !draft) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-[#241507]">
            Draft not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            This event draft could not
            be found. It may have been
            deleted from your browser
            storage.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/dashboard/create-event";
            }}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#432616] px-6 font-semibold text-white"
          >
            Create New Event
          </button>
        </div>
      </main>
    );
  }

  return (
    <CreateEventForm
      key={
        draft
          ? `${draft.id}-${draft.updatedAt ?? ""}`
          : "new-event"
      }
      draft={draft}
    />
  );
}