"use client";

import { Search } from "lucide-react";

interface EventSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function EventSearch({
  value,
  onChange,
}: EventSearchProps) {
  return (
    <div className="relative w-full">

      <Search
        size={20}
        className="
          absolute
          left-5
          top-1/2
          -translate-y-1/2
          text-gray-400
        "
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search events..."
        className="
          h-14
          w-full
          rounded-full
          border
          border-gray-200
          bg-white
          pl-14
          pr-5
          text-[15px]
          outline-none
          transition-all
          focus:border-[#8B6045]
          focus:ring-2
          focus:ring-[#8B6045]/20
        "
      />

    </div>
  );
}