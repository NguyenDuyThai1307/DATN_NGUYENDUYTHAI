"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DemoPaymentButtonProps = {
  orderId: string;
};

export function DemoPaymentButton({ orderId }: DemoPaymentButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePayment() {
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/payment/demo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Khong the thanh toan demo");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePayment}
        disabled={isSubmitting}
        className="w-full rounded-md bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Dang xu ly..." : "Thanh toan demo"}
      </button>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}