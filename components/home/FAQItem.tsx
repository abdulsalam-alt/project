"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({
  question,
  answer,
}: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="font-medium text-[#241507]">
          {question}
        </span>

        <div
          className={`
            flex h-8 w-8 items-center justify-center rounded-full transition

            ${
              open
                ? "bg-[#432616] text-white"
                : "bg-gray-100 text-gray-600"
            }
          `}
        >
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>

      <div
        className={`
          grid transition-all duration-300

          ${
            open
              ? "grid-rows-[1fr]"
              : "grid-rows-[0fr]"
          }
        `}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-gray-500 leading-7">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}