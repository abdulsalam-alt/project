"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "admin@teeket.com";
const ADMIN_PASSWORD = "Admin123!";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [emailError, setEmailError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [loginError, setLoginError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = () => {
    let valid = true;

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    /* =========================================================
       VALIDATION
    ========================================================= */

    if (!normalizedEmail) {
      setEmailError(
        "Email is required."
      );

      valid = false;
    }

    if (!password.trim()) {
      setPasswordError(
        "Password is required."
      );

      valid = false;
    }

    if (!valid) {
      return;
    }

    setLoading(true);

    /* =========================================================
       TEMPORARY MVP AUTHENTICATION

       This will later be replaced with:
       
       Login Form
          ↓
       NestJS API
          ↓
       JWT / Session
          ↓
       User Role
          ↓
       Admin or Organizer dashboard
    ========================================================= */

    const isAdmin =
      normalizedEmail === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD;

    /*
     * Store a temporary session so the application
     * knows which dashboard the user entered.
     */

    if (isAdmin) {
      localStorage.setItem(
        "teeket:session",
        JSON.stringify({
          email: normalizedEmail,
          role: "admin",
          loggedIn: true,
        })
      );

      router.push("/dashboard/admin");

      return;
    }

    /*
     * TEMPORARY ORGANIZER LOGIN
     *
     * Since the backend authentication has not been
     * connected yet, every other valid login is treated
     * as an organizer.
     */

    localStorage.setItem(
      "teeket:session",
      JSON.stringify({
        email: normalizedEmail,
        role: "organizer",
        loggedIn: true,
      })
    );

    router.push("/dashboard/events");
  };

  return (
    <div className="flex h-full flex-col px-6 py-8 sm:px-8 sm:py-10 lg:px-16">
      {/* =====================================================
          LOGO
      ===================================================== */}

      <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
        TEEKET
      </h1>

      {/* =====================================================
          LOGIN CONTENT
      ===================================================== */}

      <div className="mt-12 w-full max-w-md sm:mt-16">
        {/* Back */}
        <Link
          href="/"
          className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#432616] text-white transition hover:opacity-90 sm:mb-10 sm:h-12 sm:w-12"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </Link>

        {/* Heading */}
        <h2 className="text-3xl font-semibold text-[#18181B] sm:text-4xl">
          Welcome back
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Login to manage your TEEKET account.
        </p>

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          className="mt-8 space-y-6 sm:mt-10"
          onSubmit={(event) => {
            event.preventDefault();
            handleLogin();
          }}
        >
          {/* =================================================
              EMAIL
          ================================================= */}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#18181B]"
            >
              <span className="text-red-500">
                *
              </span>{" "}
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value
                );

                setEmailError("");
                setLoginError("");
              }}
              placeholder="Enter email address"
              autoComplete="email"
              disabled={loading}
              className={`h-14 w-full rounded-xl border bg-white px-5 text-sm outline-none transition sm:text-base ${
                emailError
                  ? "border-red-500"
                  : "border-[#D9D9D9] focus:border-[#432616]"
              } disabled:cursor-not-allowed disabled:bg-gray-50`}
            />

            {emailError && (
              <p className="mt-2 text-sm text-red-500">
                {emailError}
              </p>
            )}
          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#18181B]"
            >
              <span className="text-red-500">
                *
              </span>{" "}
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );

                  setPasswordError("");
                  setLoginError("");
                }}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
                className={`h-14 w-full rounded-xl border bg-white px-5 pr-14 text-sm outline-none transition sm:text-base ${
                  passwordError
                    ? "border-red-500"
                    : "border-[#D9D9D9] focus:border-[#432616]"
                } disabled:cursor-not-allowed disabled:bg-gray-50`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                disabled={loading}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#432616] disabled:opacity-50"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={22} />
                ) : (
                  <Eye size={22} />
                )}
              </button>
            </div>

            {passwordError && (
              <p className="mt-2 text-sm text-red-500">
                {passwordError}
              </p>
            )}
          </div>

          {/* =================================================
              LOGIN ERROR
          ================================================= */}

          {loginError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {loginError}
              </p>
            </div>
          )}

          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-[#432616] text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* ===================================================
            FORGOT PASSWORD
        =================================================== */}

        <Link
          href="/forgot-password"
          className="mt-7 inline-block text-sm text-[#432616] transition hover:underline sm:mt-8"
        >
          Forgot password?
        </Link>

        {/* ===================================================
            CREATE ACCOUNT
        =================================================== */}

        <div className="mt-8 text-center text-sm text-[#7A7A7A] sm:mt-10">
          Do not have an account?{" "}
          <Link
            href="/create-account"
            className="font-semibold text-[#432616] transition hover:underline"
          >
            Create account
          </Link>
        </div>

        {/* ===================================================
            TEMPORARY ADMIN INFORMATION

            Remove this before production.
        =================================================== */}

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-800">
            Development Admin Login
          </p>

          <p className="mt-2 text-xs text-amber-700">
            Email: admin@teeket.com
          </p>

          <p className="mt-1 text-xs text-amber-700">
            Password: Admin123!
          </p>
        </div>
      </div>
    </div>
  );
}