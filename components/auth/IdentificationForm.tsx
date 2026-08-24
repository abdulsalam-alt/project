"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import UploadArea from "./UploadArea";
import UploadGuidelines from "./UploadGuidelines";
import ProgressStepper from "./ProgressStepper";

export default function IdentificationForm() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-xl px-8 py-14">

      {/* Progress */}
      <div className="mb-14">
         <ProgressStepper currentStep={2} totalSteps={2} />
      </div>

      <button
        onClick={() => router.back()}
        className="mb-8 flex h-10 w-8 items-center justify-center rounded-lg bg-[#6b3807] text-white"
      >
        <ArrowLeft />
      </button>

      <h1 className="text-3xl font-bold text-[#18181B]">
        Create Account
      </h1>

      <div className="mt-6">
        <label className="mb-3 block font-medium">
          Upload NIN/Business License/Voters Card
        </label>

        <UploadArea />
      </div>

      <div className="mt-8">
        <UploadGuidelines />
      </div>

      <button
     type="button"
     onClick={() => router.push("/dashboard")}
     className="mt-10 h-14 w-full rounded-full bg-[#6b3807] text-lg font-semibold text-white transition hover:bg-[#6b3807]"
     >
   Sign Up
    </button>
    </div>
  );
}