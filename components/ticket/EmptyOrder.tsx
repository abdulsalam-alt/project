import { Ticket } from "lucide-react";

export default function EmptyOrder() {
  return (
    <div
      className="
        flex
        h-[260px]
        w-full
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-gray-200
        bg-white
        px-6
        text-center
      "
    >
      <Ticket
        size={70}
        strokeWidth={1.2}
        className="text-gray-300"
      />

      <p className="mt-6 text-lg text-gray-400">
        Please select your ticket type
      </p>
    </div>
  );
}