import Link from "next/link";

import FAQItem from "./FAQItem";

import { faqs } from "@/lib/data/faqs";

export default function FAQ() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 md:px-8 lg:grid-cols-[320px_1fr] lg:gap-20">
        {/* Left */}

        <div>
          <p className="font-semibold uppercase tracking-widest text-[#8B6045]">
            FAQ
          </p>

          <h2 className="mt-4 text-5xl font-bold leading-tight text-[#241507]">
            COMMON
            <br />
            <span className="text-[#8B6045]">
              QUESTIONS
            </span>
          </h2>

          <p className="mt-8 text-gray-500">
            Still have questions?
          </p>

          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-xl bg-[#8B6045] px-8 py-4 font-semibold text-white transition hover:bg-[#432616]"
          >
            Contact Us
          </Link>
        </div>

        {/* Right */}

        <div className="space-y-5">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}