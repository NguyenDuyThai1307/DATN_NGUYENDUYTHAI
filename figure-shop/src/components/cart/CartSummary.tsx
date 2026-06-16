import Link from "next/link";
import { ProductPrice } from "@/components/product/ProductPrice";

type CartSummaryProps = {
  subtotal: number;
};

export function CartSummary({ subtotal }: CartSummaryProps) {
  return (
    <aside className="h-fit rounded-md border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold">Tom tat don hang</h2>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-zinc-600">Tam tinh</span>
        <ProductPrice price={subtotal} />
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