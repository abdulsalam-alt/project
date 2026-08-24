import Link from "next/link";

export default function EventOrganizer() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-5 text-center md:px-8">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-[#241507] md:text-5xl">
          Are you Planning an event?
        </h2>

        {/* Description */}
        <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 md:text-lg">
          Teeket is your best bet when it comes to selling tickets,
          promoting and managing your event.
        </p>

        {/* Small Label */}
        <p className="mt-10 text-sm text-gray-400">
          A Fee applies if tickets are being sold
        </p>

        {/* Pricing Card */}
        <div className="mt-3 w-full max-w-3xl rounded-[22px] border border-[#432616] bg-[#FCFAFF] px-8 py-10">
          <h3 className="text-4xl font-bold text-[#241507]">
            7.5% + processing fee
          </h3>

          <p className="mt-2 text-base font-medium text-[#432616]">
            per paid ticket
          </p>

          <div className="my-8 flex items-center">
            <div className="h-px flex-1 bg-gray-200" />

            <span className="mx-5 text-sm font-semibold text-gray-400">
              
            </span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <h3 className="text-4xl font-bold text-[#241507]">
            0%
          </h3>

          <p className="mt-2 text-base font-medium text-[#432616]">
            per free ticket
          </p>
        </div>

        {/* Button */}
        <Link
          href="/login"
          className="
            mt-10
            flex
            h-16
            w-full
            max-w-3xl
            items-center
            justify-center
            rounded-full
            border
            border-[#432616]
            bg-white
            text-lg
            font-semibold
            text-[#432616]
            transition-all
            duration-300
            hover:bg-[#432616]
            hover:text-white
          "
        >
          Create Event
        </Link>
      </div>
    </section>
  );
}