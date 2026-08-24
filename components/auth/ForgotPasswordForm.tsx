"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    }

    const emailRegex =
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!emailRegex.test(email)) {
      setError("Enter a valid email address.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) return;

    setLoading(true);

    try {
      /**
       * Connect NestJS here later
       *
       * await axios.post("/auth/forgot-password", {
       *   email,
       * });
       */

      // Temporary navigation
      router.push("/reset-password");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">

      {/* Logo */}
      <h1 className="text-3xl font-bold tracking-tight">
        TEEKET
      </h1>

      {/* Back */}
      <Link
        href="/login"
        className="mt-8 flex w-fit items-center gap-2 text-sm font-medium text-[#241507] transition hover:text-[#7C3AED]"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      {/* Heading */}
      <div className="mt-8">
        <h2 className="text-4xl font-bold text-[#241507]">
          Forgot Password?
        </h2>

        <p className="mt-3 max-w-md text-gray-500">
          Enter your email address and we will send you
          a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <div className="mt-10 space-y-6">

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Email Address
          </label>

          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className={`h-12 w-full rounded-2xl border px-5 outline-none transition ${
              error
                ? "border-red-500"
                : "border-[#E5E7EB] focus:border-[#8B6045]"
            }`}
          />

          {error && (
            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="h-14 w-full rounded-full bg-gradient-to-r from-[#432616] to-[#432616] text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Link"}
        </button>

        
      </div>
    </div>
  );
}