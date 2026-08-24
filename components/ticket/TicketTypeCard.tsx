"use client";

import TicketSelector from "./TicketSelector";

interface TicketTypeCardProps {
  title: string;
  price: number;
  description: string;
  available: number;
  quantity: number;
  onQuantityChange: (value: number) => void;
}

export default function TicketTypeCard({
  title,
  price,
  description,
  available,
  quantity,
  onQuantityChange,
}: TicketTypeCardProps) {
  const formattedPrice =
    price === 0
      ? "FREE"
      : `₦${price.toLocaleString()}`;

  return (
    <div className="border-b border-gray-200 py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        {/* Ticket Details */}

        <div className="flex-1">

          <h3 className="text-2xl font-semibold text-[#241507]">
            {title}
          </h3>

          <p className="mt-2 text-2xl font-bold text-[#241507]">
            {formattedPrice}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>

          <p className="mt-2 text-sm font-medium text-[#8B6045]">
            {available.toLocaleString()} tickets available
          </p>

        </div>

        {/* Quantity Selector */}

        <div className="md:self-start">
          <TicketSelector
            value={quantity}
            onChange={onQuantityChange}
          />
        </div>

      </div>
    </div>
  );
}