"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import PasswordInput from "./PasswordInput";

export default function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {
      password: "",
      confirmPassword: "",
    };

    let valid = true;

    if (!password) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters.";
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Confirm your password.";
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      /**
       * Connect NestJS later
       *
       * await axios.post("/auth/reset-password", {
       *    password,
       *    token,
       * });
       */

      router.push("/dashboard");
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
        className="mt-8 flex w-fit items-center gap-2 text-sm font-medium text-[#241507] hover:text-[#7C3AED]"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      {/* Heading */}
      <div className="mt-8">
        <h2 className="text-4xl font-bold text-[#241507]">
          Change Password
        </h2>

        <p className="mt-2 text-gray-500">
          Update account password below.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <div>
          <PasswordInput
            label="Password"
            value={password}
            placeholder="Enter new password"
            onChange={setPassword}
          />

          {errors.password && (
            <p className="mt-2 text-sm text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            placeholder="Confirm new password"
            onChange={setConfirmPassword}
          />

          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 h-14 w-full rounded-full bg-gradient-to-r from-[#432616] to-[#432616] text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Updating..."
            : "login"}
        </button>
      </form>
    </div>
  );
}