import Link from "next/link";

interface Props {
  price: string;
  slug: string;
}

export default function TicketCard({
  price,
  slug,
}: Props) {
  return (
    <section className="mx-auto my-12 max-w-7xl px-5 md:px-8">
      <div className="max-w-md">
        <div className="mb-6 rounded-3xl border border-[#8B6045]/20 bg-[#F7EFE8] p-6">
          <p className="text-sm text-gray-500">
            Ticket Price
          </p>

          <h3 className="mt-2 text-3xl font-bold text-[#8B6045]">
            {price}
          </h3>
        </div>

        <Link
          href={`/ticket/${slug}`}
          className="flex h-14 items-center justify-center rounded-full bg-[#7C3AED] text-white transition hover:bg-[#6D28D9]"
        >
          Get Ticket
        </Link>
      </div>
    </section>
  );
}