"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  productId: string;
  quantity?: number;
  label?: string;
  className?: string;
  onSuccess?: () => void;
};

export function AddToCartButton({
  productId,
  quantity = 1,
  label = "Them vao gio hang",
  className,
  onSuccess,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAddToCart() {
    setIsSubmitting(true);
    setMessage("");

    const response = await fetch("/api/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        quantity,
      }),
    });

    setIsSubmitting(false);

    if (response.status === 401) {
      router.push("/login");
      return;
    }

    if (!response.ok) {
      setMessage("Khong the them vao gio hang");
      return;
    }

    setMessage("Da them vao gio hang");
    router.refresh();
    onSuccess?.();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isSubmitting}
        className={cn(
          "rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        {isSubmitting ? "Dang them..." : label}
      </button>

      {message ? <p className="mt-2 text-sm text-zinc-600">{message}</p> : null}
    </div>
  );
}
