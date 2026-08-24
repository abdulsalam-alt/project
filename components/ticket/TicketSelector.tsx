"use client";

interface TicketSelectorProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export default function TicketSelector({
  value,
  onChange,
  max = 10,
}: TicketSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="
        h-11
        w-20
        rounded-lg
        border
        border-gray-300
        bg-white
        px-3
        text-base
        outline-none
        transition
        focus:border-[#241507]
        focus:ring-2
        focus:ring-[#241507]/20
      "
    >
      {Array.from({ length: max + 1 }).map((_, index) => (
        <option key={index} value={index}>
          {index}
        </option>
      ))}
    </select>
  );
}