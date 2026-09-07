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
  const isUnavailable = !isPreorder && stock <= 0;

  return (
    <div className="mt-7 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-zinc-900">Số lượng</span>
          <p className="mt-1 text-xs text-zinc-500">
            {isPreorder
              ? "Có thể đặt trước nhiều sản phẩm trong một đơn."
              : stock > 0
                ? `Còn ${stock} sản phẩm trong kho.`
                : "Sản phẩm hiện đang hết hàng."}
          </p>
        </div>

        <div className="inline-flex h-10 items-center overflow-hidden rounded-md border border-zinc-300 bg-white">
          <button
            type="button"
            className="grid h-full w-10 place-items-center text-zinc-600 transition hover:bg-rose-50 hover:text-[var(--brand-strong)] disabled:opacity-40"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          <span className="grid min-w-10 place-items-center border-x border-zinc-300 text-sm font-bold">{quantity}</span>
          <button
            type="button"
            className="grid h-full w-10 place-items-center text-zinc-600 transition hover:bg-rose-50 hover:text-[var(--brand-strong)] disabled:opacity-40"
            onClick={() => setQuantity((value) => Math.min(maximum, value + 1))}
            disabled={quantity >= maximum}
            aria-label="Tăng số lượng"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <AddToCartButton
          productId={productId}
          quantity={quantity}
          label="Thêm vào giỏ"
          disabled={isUnavailable}
          className="w-full border border-[var(--brand-strong)] bg-white text-[var(--brand-strong)] hover:bg-rose-50"
        />
        <AddToCartButton
          productId={productId}
          quantity={quantity}
          label={isPreorder ? "Đặt trước ngay" : "Mua ngay"}
          disabled={isUnavailable}
          className="w-full bg-[var(--brand-strong)] hover:bg-[#982934]"
          onSuccess={() => router.push("/cart")}
        />
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-500">
        <ShoppingBag size={14} aria-hidden="true" />
        Thêm sản phẩm để áp dụng coupon trong giỏ hàng.
      </p>
    </div>
  );
}
