"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
const steps = [
  {
    number: "01.",
    title: "Discover",
    description:
      "Find concerts, festivals, conferences, sports and many more happening around you.",
  },
  {
    number: "02.",
    title: "Book",
    description:
      "Reserve your ticket securely in just a few taps.",
  },
  {
    number: "03.",
    title: "Get Ticket",
    description:
      "Receive your digital ticket instantly after booking.",
  },
  {
    number: "04.",
    title: "Attend",
    description:
      "Scan your QR ticket at the venue and enjoy an amazing experience.",
  },
];

export default function HowItWorks() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
  {
    align: "start",
    dragFree: true,
    containScroll: "keepSnaps",
    loop: false,
  },
  [WheelGesturesPlugin()]
);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSelected = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    updateSelected();

    emblaApi.on("select", updateSelected);
    emblaApi.on("reInit", updateSelected);

    return () => {
      emblaApi.off("select", updateSelected);
      emblaApi.off("reInit", updateSelected);
    };
  }, [emblaApi]);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5">
        {/* Heading */}
        <div className="mb-12 flex items-center gap-6">
          <h2 className="whitespace-nowrap text-3xl font-bold text-black md:text-4xl">
            How it works
          </h2>

          <div className="h-[2px] flex-1 bg-black" />
        </div>

        {/* Carousel */}

<div
  ref={emblaRef}
  className="overflow-hidden cursor-grab active:cursor-grabbing"
>
  <div className="flex">

    {steps.map((step) => (
      <div
        key={step.number}
        className="min-w-[320px] sm:min-w-[340px] md:min-w-[360px] lg:min-w-[390px] xl:min-w-[420px] mr-6"
      >
        <div
          className="
            h-[300px]
            rounded-[24px]
            bg-[#F7F7F7]
            border
            border-gray-200
            p-8
            transition-all
            duration-300
            hover:shadow-lg
          "
        >
          <p className="text-5xl font-light text-gray-400">
            {step.number}
          </p>

          <h3 className="mt-5 text-3xl font-semibold text-gray-700">
            {step.title}
          </h3>

          <p className="mt-8 text-[15px] leading-7 text-gray-500">
            {step.description}
          </p>
        </div>
      </div>
    ))}

  </div>
</div>

        {/* Pagination */}
        <div className="mt-10 flex justify-center gap-3">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`transition-all duration-300 ${
                selectedIndex === index
                  ? "h-3 w-8 rounded-full bg-[#8B6045]"
                  : "h-3 w-3 rounded-full bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}