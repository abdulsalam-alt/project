"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ImagePlus,
  X,
} from "lucide-react";
import {
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  getEventDraft,
  saveEventDraft,
} from "@/lib/dashboard/event";

import type { EventCategory } from "@/lib/data/event";

interface EventDetailsFormProps {
  draftId?: string | null;
}

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

export default function EventDetailsForm({
  draftId,
}: EventDetailsFormProps) {
  const router = useRouter();
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const existingDraft = draftId
    ? getEventDraft(draftId)
    : null;

  const [title, setTitle] = useState(
    existingDraft?.title ?? ""
  );

  const [description, setDescription] =
    useState(
      existingDraft?.description ?? ""
    );

  const [category, setCategory] =
    useState<EventCategory | "">(
      existingDraft?.category ?? ""
    );

  const [image, setImage] =
    useState(existingDraft?.image ?? "");

  const [currentDraftId, setCurrentDraftId] =
    useState<string | null>(
      existingDraft?.id ??
        draftId ??
        null
    );

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    category?: string;
    image?: string;
  }>({});

  const [saving, setSaving] =
    useState(false);

  const validate = () => {
    const nextErrors: typeof errors = {};

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

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        image:
          "Please select a valid image file.",
      }));

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        image:
          "Image must be less than 5MB.",
      }));

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImage(
        typeof reader.result === "string"
          ? reader.result
          : ""
      );

      setErrors((previous) => ({
        ...previous,
        image: undefined,
      }));
    };

    reader.readAsDataURL(file);
  };

  const saveDraft = () => {
    const saved = saveEventDraft({
      id: currentDraftId ?? undefined,

      title,
      description,
      category,
      image,

      currentStep: "details",
      status: "draft",
    });

    setCurrentDraftId(saved.id);

    return saved;
  };

  const handleSaveDraft = () => {
    setSaving(true);

    try {
      saveDraft();

      router.push("/dashboard/events");
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (!validate()) {
      return;
    }

    const saved = saveEventDraft({
      id: currentDraftId ?? undefined,

      title,
      description,
      category,
      image,

      currentStep: "location",
      status: "draft",
    });

    setCurrentDraftId(saved.id);

    router.push(
      `/dashboard/create-event/location?draftId=${encodeURIComponent(
        saved.id
      )}`
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start gap-3 sm:gap-4">
          <Link
            href="/dashboard/events"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616] sm:h-11 sm:w-11"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-2xl font-semibold text-[#241507] sm:text-3xl">
              Create Event
            </h1>

            <p className="mt-1 text-sm text-gray-500 sm:mt-2">
              Add the basic information about your event.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            <div className="h-2 flex-1 rounded-full bg-[#432616]" />
            <div className="h-2 flex-1 rounded-full bg-gray-200" />
            <div className="h-2 flex-1 rounded-full bg-gray-200" />
          </div>

          <div className="mt-3 flex justify-between text-[11px] sm:text-sm">
            <span className="font-medium text-[#432616]">
              Event Details
            </span>

            <span className="text-gray-400">
              Location & Time
            </span>

            <span className="text-gray-400">
              Tickets
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-8">
          <div className="space-y-6">
            {/* TITLE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241507]">
                Event Title
              </label>

              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);

                  if (errors.title) {
                    setErrors((previous) => ({
                      ...previous,
                      title: undefined,
                    }));
                  }
                }}
                placeholder="Enter event title"
                className={`h-14 w-full rounded-xl border px-5 outline-none ${
                  errors.title
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#432616]"
                }`}
              />

              {errors.title && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.title}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241507]">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);

                  if (errors.description) {
                    setErrors((previous) => ({
                      ...previous,
                      description:
                        undefined,
                    }));
                  }
                }}
                placeholder="Tell people about your event"
                rows={6}
                className={`w-full resize-none rounded-xl border px-5 py-4 outline-none ${
                  errors.description
                    ? "border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#432616]"
                }`}
              />

              {errors.description && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241507]">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(
                    e.target
                      .value as EventCategory | ""
                  );

                  if (errors.category) {
                    setErrors((previous) => ({
                      ...previous,
                      category: undefined,
                    }));
                  }
                }}
                className={`h-14 w-full rounded-xl border bg-white px-5 outline-none ${
                  errors.category
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">
                  Select category
                </option>

                {categories.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.category}
                </p>
              )}
            </div>

            {/* IMAGE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#241507]">
                Event Image
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className={`relative flex min-h-52 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed ${
                  errors.image
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50 hover:border-[#432616]"
                }`}
              >
                {image ? (
                  <>
                    <img
                      src={image}
                      alt="Event preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    <span className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-3 py-2 text-xs font-medium text-white">
                      Change image
                    </span>
                  </>
                ) : (
                  <div className="text-center">
                    <ImagePlus
                      size={32}
                      className="mx-auto mb-3 text-gray-400"
                    />

                    <p className="text-sm font-medium text-gray-600">
                      Click to upload event image
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      PNG, JPG or WEBP · Maximum 5MB
                    </p>
                  </div>
                )}
              </button>

              {errors.image && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.image}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="h-12 rounded-xl border border-gray-300 px-6 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save as Draft"}
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="h-12 rounded-xl bg-[#432616] px-8 font-semibold text-white hover:opacity-90"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}