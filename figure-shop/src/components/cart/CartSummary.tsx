import Link from "next/link";
import { ProductPrice } from "@/components/product/ProductPrice";

type CartSummaryProps = {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
};

export function CartSummary({
  subtotal,
  discountAmount,
  shippingFee,
  total,
}: CartSummaryProps) {
  return (
    <aside className="h-fit rounded-md border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold">Tom tat don hang</h2>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Tam tinh</span>
          <ProductPrice price={subtotal} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Giam gia</span>
          <span className="font-medium text-zinc-950">
            -{discountAmount.toLocaleString("vi-VN")} d
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Phi giao hang</span>
          {shippingFee === 0 ? (
            <span className="font-medium text-emerald-700">Mien phi</span>
          ) : (
            <ProductPrice price={shippingFee} />
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4">
        <span className="font-semibold">Tong cong</span>
        <ProductPrice price={total} />
      </div>

      <Link
        href="/checkout"
        className="mt-5 block rounded-md bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Thanh toan
      </Link>
    </aside>
  );
}