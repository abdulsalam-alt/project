"use client";

import { X } from "lucide-react";

interface CategoryFilterChipProps {
  category: string;
  onClear: () => void;
}

const categoryLabels: Record<string, string> = {
  community: "Community",
  "art-culture": "Art / Culture",
  "sport-wellness": "Sport / Wellness",
  "career-business": "Career / Business",
  concerts: "Concerts",
  "food-drinks": "Food / Drinks",
  "spirituality-religion": "Spirituality / Religion",
  "night-life": "Night Life",
};

export default function CategoryFilterChip({
  category,
  onClear,
}: CategoryFilterChipProps) {
  if (category === "all") return null;

  return (
    <div className="mt-6 flex items-center">
      <button
        type="button"
        onClick={onClear}
        className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-[#8B6045]
          bg-[#F7EFE8]
          px-5
          py-2.5
          text-sm
          font-medium
          text-[#8B6045]
          transition
          hover:bg-[#8B6045]
          hover:text-white
        "
      >
        <span>
          {categoryLabels[category] ?? category}
        </span>

        <X
          size={16}
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}