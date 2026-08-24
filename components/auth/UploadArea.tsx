"use client";

import { CloudUpload } from "lucide-react";

export default function UploadArea() {
  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-8">
      <label
        htmlFor="document"
        className="flex cursor-pointer flex-col items-center justify-center"
      >
        <div className="flex h-12 w-8 items-center justify-center rounded-xl border border-gray-300">
          <CloudUpload className="h-6 w-4 text-gray-500" />
        </div>

        <p className="mt-6 font-medium text-[#6b3807]">
          Tap to upload photo
        </p>

        <p className="mt-2 text-sm text-gray-500">
          JPG, PNG or PDF (max 5MB)
        </p>

        <input
          id="document"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
        />
      </label>
    </div>
  );
}