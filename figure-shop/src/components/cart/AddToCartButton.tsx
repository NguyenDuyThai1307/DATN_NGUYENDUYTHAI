"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, LoaderCircle, TriangleAlert } from "lucide-react";

type AddToCartButtonProps = {
  productId: string;
  quantity?: number;
  label?: string;
  children?: ReactNode;
  ariaLabel?: string;
  className?: string;
  onSuccess?: () => void;
  showMessage?: boolean;
  disabled?: boolean;
};

export function AddToCartButton({
  productId,
  quantity = 1,
  label = "Thêm vào giỏ hàng",
  children,
  ariaLabel,
  className,
  onSuccess,
  showMessage = true,
  disabled = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  async function handleAddToCart() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage("");
    setSucceeded(false);

    try {
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

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setMessage(data?.message ?? "Không thể thêm vào giỏ hàng");
        return;
      }

      setMessage("Đã thêm vào giỏ hàng");
      setSucceeded(true);
      window.dispatchEvent(new Event("cart-added"));
      router.refresh();
      onSuccess?.();
    } catch {
      setMessage("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || isSubmitting}
        aria-label={ariaLabel ?? label}
        aria-busy={isSubmitting}
        title={message || ariaLabel || label}
        className={cn(
          "motion-button rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        {children ? (isSubmitting ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : message ? (succeeded ? <Check size={18} aria-hidden="true" /> : <TriangleAlert size={18} aria-hidden="true" />) : children) : <span className="relative block"><span className={isSubmitting ? "invisible" : ""}>{label}</span>{isSubmitting && <span className="absolute inset-0 grid place-items-center"><LoaderCircle size={18} className="animate-spin" aria-hidden="true" /></span>}</span>}
      </button>

      <p role="status" className={showMessage ? "mt-2 min-h-5 text-sm text-zinc-600" : "sr-only"}>{message}</p>
    </div>
  );
}
