"use client";

interface CountryCodeSelectProps {
  code: string;
  phone: string;
  onCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  error?: string;
}

const countries = [
  {
    code: "+234",
    country: "NG",
  },
  {
    code: "+233",
    country: "GH",
  },
  {
    code: "+1",
    country: "US",
  },
  {
    code: "+44",
    country: "UK",
  },
];

export default function CountryCodeSelect({
  code,
  phone,
  onCodeChange,
  onPhoneChange,
  error,
}: CountryCodeSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#241507]">
        Phone Number
      </label>

      <div className="flex gap-3">
        <select
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className={`h-12 w-28 rounded-2xl border px-3 outline-none transition ${
            error
              ? "border-red-500"
              : "border-[#E5E7EB] focus:border-[#8B6045]"
          }`}
        >
          {countries.map((country) => (
            <option
              key={country.code}
              value={country.code}
            >
              {country.country} {country.code}
            </option>
          ))}
        </select>

        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="8012345678"
          className={`h-12 flex-1 rounded-2xl border px-5 outline-none transition ${
            error
              ? "border-red-500"
              : "border-[#E5E7EB] focus:border-[#8B6045]"
          }`}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}