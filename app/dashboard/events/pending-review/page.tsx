"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  ShieldCheck,
} from "lucide-react";

export default function PendingReviewPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      <div className="mb-8">

        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/events")
          }
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616]"
        >
          <ArrowLeft size={19} />
        </button>

        <h1 className="text-3xl font-semibold text-[#241507]">
          Pending Admin Review
        </h1>

        <p className="mt-2 text-gray-500">
          Your event has been submitted and is waiting
          for approval.
        </p>

      </div>

      <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">

          <Clock3
            size={38}
            className="text-amber-500"
          />

        </div>

        <h2 className="mt-6 text-2xl font-semibold text-[#241507]">
          Awaiting Admin Approval
        </h2>

        <p className="mx-auto mt-3 max-w-xl leading-7 text-gray-500">
          Your event has been successfully submitted for
          review. It will not appear publicly until an
          administrator approves it.
        </p>

        <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-left">

          <div className="flex gap-4">

            <ShieldCheck
              size={22}
              className="mt-0.5 shrink-0 text-[#432616]"
            />

            <div>

              <p className="font-medium text-[#241507]">
                What happens next?
              </p>

              <ul className="mt-3 space-y-2 text-sm text-gray-500">

                <li>
                  • Admin reviews your event.
                </li>

                <li>
                  • Admin approves or requests changes.
                </li>

                <li>
                  • Once approved, your event becomes
                  visible to attendees.
                </li>

                <li>
                  • Ticket sales can then begin according
                  to your configured sales period.
                </li>

              </ul>

            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/events")
          }
          className="mt-8 h-12 rounded-xl bg-[#432616] px-8 font-semibold text-white transition hover:opacity-90"
        >
          Go to My Events
        </button>

      </div>

    </div>
  );
}