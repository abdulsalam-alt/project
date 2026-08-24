"use client";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
} from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  getEventDraft,
  saveEventDraft,
} from "@/lib/dashboard/event";

type Bank = {
  code: string;
  name: string;
};

const banks: Bank[] = [
  { code: "044", name: "Access Bank" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank" },
  { code: "103", name: "Globus Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "50211", name: "Kuda Bank" },
  { code: "303", name: "Lotus Bank" },
  { code: "50515", name: "Moniepoint" },
  { code: "999992", name: "Opay" },
  { code: "999991", name: "PalmPay" },
  { code: "076", name: "Polaris Bank" },
  { code: "105", name: "PremiumTrust Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "302", name: "Taj Bank" },
  { code: "033", name: "UBA" },
  { code: "032", name: "Union Bank" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
];

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const draftId = searchParams.get("draftId");

  const draft = draftId ? getEventDraft(draftId) : null;

  const [bankCode, setBankCode] = useState(
    draft?.payment?.bankCode ?? ""
  );

  const [bankName, setBankName] = useState(
    draft?.payment?.bankName ?? ""
  );

  const [accountNumber, setAccountNumber] = useState(
    draft?.payment?.accountNumber ?? ""
  );

  const [accountName, setAccountName] = useState(
    draft?.payment?.accountName ?? ""
  );

  const [errors, setErrors] = useState("");

  const goBack = () => {
    if (!draftId) {
      router.push("/dashboard/create-event/tickets/paid");
      return;
    }

    router.push(
      `/dashboard/create-event/tickets/paid?draftId=${encodeURIComponent(
        draftId
      )}`
    );
  };

  const handleBankChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCode = event.target.value;

    const selectedBank = banks.find(
      (bank) => bank.code === selectedCode
    );

    setBankCode(selectedCode);
    setBankName(selectedBank?.name ?? "");
    setErrors("");
  };

  const handleContinue = () => {
    setErrors("");

    if (!draftId) {
      setErrors("Event draft could not be found.");
      return;
    }

    if (!bankCode) {
      setErrors("Please select your bank.");
      return;
    }

    if (!bankName) {
      setErrors("Please select your bank.");
      return;
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      setErrors(
        "Account number must contain exactly 10 digits."
      );
      return;
    }

    if (!accountName.trim()) {
      setErrors("Account name is required.");
      return;
    }

    saveEventDraft({
      id: draftId,

      payment: {
        bankCode,
        bankName,
        accountNumber,
        accountName: accountName.trim(),
      },

      currentStep: "review",

      status: "draft",
    });

    router.push(
      `/dashboard/create-event/review?draftId=${encodeURIComponent(
        draftId
      )}`
    );
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#432616] transition hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-[#241507] sm:text-3xl">
              Payment Details
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
              Enter the account where your event ticket
              payments will be paid.
            </p>
          </div>
        </div>

        {/* Content */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#432616]/10 text-[#432616]">
            <Building2 size={24} />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-[#241507]">
            Payout account
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Enter the bank account where ticket revenue
            should be paid.
          </p>

          <div className="mt-6 space-y-5">
            {/* Bank */}
            <div>
              <label
                htmlFor="bank"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Bank
              </label>

              <select
                id="bank"
                value={bankCode}
                onChange={handleBankChange}
                className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#432616]"
              >
                <option value="">
                  Select bank
                </option>

                {banks.map((bank) => (
                  <option
                    key={bank.code}
                    value={bank.code}
                  >
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label
                htmlFor="account-number"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Account number
              </label>

              <input
                id="account-number"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={10}
                value={accountNumber}
                onChange={(event) => {
                  const value =
                    event.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setAccountNumber(value);
                  setErrors("");
                }}
                placeholder="0123456789"
                className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#432616]"
              />

              <p className="mt-2 text-xs text-gray-400">
                Enter your 10-digit Nigerian bank account
                number.
              </p>
            </div>

            {/* Account Name */}
            <div>
              <label
                htmlFor="account-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Account name
              </label>

              <input
                id="account-name"
                type="text"
                value={accountName}
                onChange={(event) => {
                  setAccountName(event.target.value);
                  setErrors("");
                }}
                placeholder="Account holder name"
                className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none transition focus:border-[#432616]"
              />

              <p className="mt-2 text-xs text-gray-400">
                This should match the name on the bank
                account.
              </p>
            </div>
          </div>

          {/* Error */}
          {errors && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {errors}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={goBack}
              className="flex h-12 items-center justify-center rounded-xl border border-gray-300 bg-white px-6 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#432616] px-7 font-semibold text-white transition hover:opacity-90"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}