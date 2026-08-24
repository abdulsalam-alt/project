"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import ProgressStepper from "./ProgressStepper";
import PasswordInput from "./PasswordInput";
import CountryCodeSelect from "./CountryCodeSelect";

export default function CreateAccountForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    organizationType: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+234",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    organizationType: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      businessName: "",
      organizationType: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    };

    let valid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
      valid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
      valid = false;
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required.";
      valid = false;
    }

    if (!formData.organizationType) {
      newErrors.organizationType =
        "Please select an organization type.";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        formData.email
      )
    ) {
      newErrors.email = "Please enter a valid email.";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters.";
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
      valid = false;
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
      valid = false;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber =
        "Phone number is required.";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    router.push("/create-account/identification");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">

      <h1 className="text-3xl font-bold tracking-tight">
        TEEKET
      </h1>

      <ProgressStepper
        currentStep={1}
        totalSteps={2}
      />

      <Link
        href="/"
        className="mt-8 flex w-fit items-center gap-2 text-sm font-medium text-[#241507] hover:text-[#7C3AED]"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="mt-8">
        <h1 className="text-3xl font-bold text-[#241507]">
          Create Account
        </h1>

        <p className="mt-2 text-gray-500">
          Create your organizer account to start
          hosting events.
        </p>
      </div>

      <form className="mt-6 space-y-5">

        {/* First Name + Last Name */}

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium">
              First Name
            </label>

            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  firstName: e.target.value,
                });

                setErrors({
                  ...errors,
                  firstName: "",
                });
              }}
              placeholder="ANIMASAUN"
              className={`h-12 w-full rounded-2xl border px-5 outline-none transition ${
                errors.firstName
                  ? "border-red-500"
                  : "border-gray-300 focus:border-[#8B6045]"
              }`}
            />

            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Last Name
            </label>

            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  lastName: e.target.value,
                });

                setErrors({
                  ...errors,
                  lastName: "",
                });
              }}
              placeholder="ABDUL SALAM"
              className={`h-12 w-full rounded-2xl border px-5 outline-none transition ${
                errors.lastName
                  ? "border-red-500"
                  : "border-gray-300 focus:border-[#8B6045]"
              }`}
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lastName}
              </p>
            )}
          </div>

        </div>
                {/* Business Name */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Business Name
          </label>

          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => {
              setFormData({
                ...formData,
                businessName: e.target.value,
              });

              setErrors({
                ...errors,
                businessName: "",
              });
            }}
            placeholder="Teeket Events"
            className={`h-12 w-full rounded-2xl border px-5 outline-none transition ${
              errors.businessName
                ? "border-red-500"
                : "border-gray-300 focus:border-[#8B6045]"
            }`}
          />

          {errors.businessName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.businessName}
            </p>
          )}
        </div>

        {/* Organization Type */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Organization Type
          </label>

          <select
            value={formData.organizationType}
            onChange={(e) => {
              setFormData({
                ...formData,
                organizationType: e.target.value,
              });

              setErrors({
                ...errors,
                organizationType: "",
              });
            }}
            className={`h-12 w-full rounded-2xl border px-5 outline-none transition ${
              errors.organizationType
                ? "border-red-500"
                : "border-gray-300 focus:border-[#8B6045]"
            }`}
          >
            <option value="">Select organization type</option>
            <option value="Business">Business</option>
            <option value="Individual">Individual</option>
            <option value="NGO">NGO</option>
            <option value="School">School</option>
            <option value="Religious Organization">
              Religious Organization
            </option>
          </select>

          {errors.organizationType && (
            <p className="mt-1 text-sm text-red-500">
              {errors.organizationType}
            </p>
          )}
        </div>

        {/* Email */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Email Address
          </label>

          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({
                ...formData,
                email: e.target.value,
              });

              setErrors({
                ...errors,
                email: "",
              });
            }}
            placeholder="example@email.com"
            className={`h-12 w-full rounded-2xl border px-5 outline-none transition ${
              errors.email
                ? "border-red-500"
                : "border-gray-300 focus:border-[#8B6045]"
            }`}
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}

        <PasswordInput
          label="Password"
          value={formData.password}
          placeholder="Enter password"
          onChange={(value) => {
            setFormData({
              ...formData,
              password: value,
            });

            setErrors({
              ...errors,
              password: "",
            });
          }}
          error={errors.password}
        />

        {/* Confirm Password */}

        <PasswordInput
          label="Confirm Password"
          value={formData.confirmPassword}
          placeholder="Confirm password"
          onChange={(value) => {
            setFormData({
              ...formData,
              confirmPassword: value,
            });

            setErrors({
              ...errors,
              confirmPassword: "",
            });
          }}
          error={errors.confirmPassword}
        />
                {/* Phone Number */}

        <CountryCodeSelect
          code={formData.countryCode}
          phone={formData.phoneNumber}
          onCodeChange={(value) =>
            setFormData({
              ...formData,
              countryCode: value,
            })
          }
          onPhoneChange={(value) => {
            setFormData({
              ...formData,
              phoneNumber: value,
            });

            setErrors({
              ...errors,
              phoneNumber: "",
            });
          }}
          error={errors.phoneNumber}
        />

        {errors.phoneNumber && (
          <p className="-mt-2 text-sm text-red-500">
            {errors.phoneNumber}
          </p>
        )}

        {/* Continue */}

        <button
          type="button"
          onClick={handleContinue}
          className="mt-4 h-14 w-full rounded-full bg-[#6B3807] text-lg font-semibold text-white transition hover:bg-[#5B2F06]"
        >
          Continue
        </button>

      </form>
    </div>
  );
}