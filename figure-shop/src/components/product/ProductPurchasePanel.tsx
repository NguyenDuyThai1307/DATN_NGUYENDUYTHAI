"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

type ProductPurchasePanelProps = {
  productId: string;
  stock: number;
  isPreorder: boolean;
};

export function ProductPurchasePanel({
  productId,
  stock,
  isPreorder,
}: ProductPurchasePanelProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const maximum = isPreorder ? 99 : Math.max(stock, 1);

  return (
    <div className="mt-7 border-y border-zinc-200 py-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-semibold text-zinc-800">So luong</span>
        <div className="inline-flex h-10 items-center overflow-hidden rounded-md border border-zinc-300 bg-white">
          <button
            type="button"
            className="grid h-full w-10 place-items-center text-zinc-600 transition hover:bg-rose-50 hover:text-[var(--brand-strong)] disabled:opacity-40"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Giam so luong"
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          <span className="grid min-w-10 place-items-center border-x border-zinc-300 text-sm font-bold">{quantity}</span>
          <button
            type="button"
            className="grid h-full w-10 place-items-center text-zinc-600 transition hover:bg-rose-50 hover:text-[var(--brand-strong)] disabled:opacity-40"
            onClick={() => setQuantity((value) => Math.min(maximum, value + 1))}
            disabled={quantity >= maximum}
            aria-label="Tang so luong"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
        {!isPreorder ? <span className="text-xs text-zinc-500">Con {stock} san pham</span> : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <AddToCartButton
          productId={productId}
          quantity={quantity}
          label="Them vao gio"
          className="w-full border border-[var(--brand-strong)] bg-white text-[var(--brand-strong)] hover:bg-rose-50"
        />
        <AddToCartButton
          productId={productId}
          quantity={quantity}
          label={isPreorder ? "Dat truoc ngay" : "Mua ngay"}
          className="w-full bg-[var(--brand-strong)] hover:bg-[#982934]"
          onSuccess={() => router.push("/cart")}
        />
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-500">
        <ShoppingBag size={14} aria-hidden="true" />
        Them san pham de ap dung coupon trong gio hang.
      </p>
    </div>
  );
}
