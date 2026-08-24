import Image from "next/image";
import {
  CalendarCheck,
  CreditCard,
  BarChart3,
} from "lucide-react";

import FeatureCard from "./FeatureCard";

export default function AuthHero() {
  return (
    <section className="relative flex h-screen flex-col justify-between overflow-hidden bg-[#14041D] p-14">
      {/* Background Illustration */}
      <Image
        src="/images/auth/ auth-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center opacity-35 mix-blend-lighten"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#14041D]" />

      {/* Content */}
      <div className="relative z-10 max-w-xl pt-10">
        <h1 className="text-5xl font-semibold leading-tight text-white">
          Host
          <br />
          <span className="text-[#8B5CF6]">
            Unforgettable
          </span>{" "}
          Events
        </h1>

        <p className="mt-8 text-lg leading-8 text-white/75">
          Create, manage and promote events effortlessly.
          Reach thousands of attendees with secure payments,
          instant ticket delivery and powerful analytics.
        </p>
      </div>

      {/* Features */}
      <div className="relative z-10 grid grid-cols-3 gap-5">
        <FeatureCard
          icon={CalendarCheck}
          title="Fast Setup"
          description="Launch events within minutes."
        />

        <FeatureCard
          icon={CreditCard}
          title="Secure Payments"
          description="Reliable payment collection."
        />

        <FeatureCard
          icon={BarChart3}
          title="Analytics"
          description="Track registrations and sales."
        />
      </div>
    </section>
  );
}