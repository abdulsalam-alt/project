import { Check } from "lucide-react";

const guidelines = [
  "Use a clear, front-facing photo",
  "Good lighting and plain background",
  "No sunglasses or hats",
  "Your face should be clearly visible",
];

export default function UploadGuidelines() {
  return (
    <div className="rounded-2xl border border-[#6b3807]/40 bg-[#FFFFFF] p-6">
      <h3 className="mb-4 font-semibold text-gray-900">
        Guidelines
      </h3>

      <div className="space-y-3">
        {guidelines.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <Check className="h-5 w-5 text-[#6b3807]" />

            <p className="text-sm text-gray-600">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}