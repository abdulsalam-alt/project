"use client";

interface OrderSummaryProps {
  eventTitle: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  onContinue: () => void;
}

export default function OrderSummary({
  eventTitle,
  items,
  onContinue,
}: OrderSummaryProps) {
  const selectedItems = items.filter(
    (item) => item.quantity > 0
  );

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const serviceFee = subtotal * 0.075;

  const total = subtotal + serviceFee;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-[#241507]">
        Confirm Order
      </h2>

      <p className="mt-1 text-gray-500">
        {eventTitle}
      </p>

      <div className="my-6 border-t" />

      {selectedItems.map((item) => (
        <div
          key={item.name}
          className="mb-5 flex items-center justify-between"
        >
          <div>
            <h3 className="font-medium text-[#241507]">
              {item.name}
            </h3>

            <p className="text-sm text-gray-500">
              Qty: {item.quantity}
            </p>
          </div>

          <p className="font-semibold">
            ₦{(item.price * item.quantity).toLocaleString()}
          </p>
        </div>
      ))}

      <div className="space-y-3 border-t pt-6">
        <div className="flex justify-between">
          <span className="text-gray-500">
            Subtotal
          </span>

          <span>
            ₦{subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">
            Service Fee (7.5%)
          </span>

          <span>
            ₦{serviceFee.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between border-t pt-4 text-xl font-bold">
          <span>Total</span>

          <span className="text-[#241507]">
            ₦{total.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="
          mt-8
          h-14
          w-full
          rounded-xl
          bg-[#241507]
          text-lg
          font-medium
          text-white
          transition
          hover:bg-[#5B31D6]
        "
      >
        Continue
      </button>
    </div>
  );
}