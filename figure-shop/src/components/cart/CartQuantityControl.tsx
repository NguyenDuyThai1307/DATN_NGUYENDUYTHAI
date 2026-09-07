"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type CartQuantityControlProps = {
  itemId: string;
  quantity: number;
};

export function CartQuantityControl({
  itemId,
  quantity,
}: CartQuantityControlProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function updateQuantity(nextQuantity: number) {
    setIsSubmitting(true);
    setError("");

    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: nextQuantity,
      }),
    });

    const data = await response.json().catch(() => null);

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data?.message ?? "Không thể cập nhật số lượng");
      return;
    }

    router.refresh();
  }

  async function removeItem() {
    setIsSubmitting(true);
    setError("");

    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => null);

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data?.message ?? "Không thể xóa sản phẩm");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-md border border-zinc-300 bg-white">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => updateQuantity(quantity - 1)}
          className="px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          -
        </button>

        <span className="min-w-10 border-x border-zinc-300 px-3 py-1.5 text-center text-sm">
          {quantity}
        </span>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => updateQuantity(quantity + 1)}
          className="px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          +
        </button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isSubmitting}
        onClick={removeItem}
      >
        Xóa
      </Button>
      </div>

      {error ? (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
