import Link from "next/link";
import { CouponInput } from "@/components/cart/CouponInput";
import { ProductPrice } from "@/components/product/ProductPrice";

type CartSummaryProps = {
  subtotal: number;
  productDiscountAmount: number;
  couponDiscountAmount: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  coupon?: {
    code: string;
    name: string;
  } | null;
};

export function CartSummary({
  subtotal,
  productDiscountAmount,
  couponDiscountAmount,
  discountAmount,
  shippingFee,
  total,
  coupon,
}: CartSummaryProps) {
  return (
    <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
          Buoc tiep theo
        </p>
        <h2 className="mt-1 text-lg font-bold text-zinc-950">
          Tom tat don hang
        </h2>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Tam tinh</span>
          <ProductPrice price={subtotal} />
        </div>

        {productDiscountAmount > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Giam san pham</span>
            <span className="font-medium text-red-600">
              -{productDiscountAmount.toLocaleString("vi-VN")} d
            </span>
          </div>
        ) : null}

        {couponDiscountAmount > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Giam coupon</span>
            <span className="font-medium text-red-600">
              -{couponDiscountAmount.toLocaleString("vi-VN")} d
            </span>
          </div>
        ) : null}

        {discountAmount === 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Giam gia</span>
            <span className="font-medium text-zinc-950">-0 d</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Phi giao hang</span>
          {shippingFee === 0 ? (
            <span className="font-medium text-emerald-700">Mien phi</span>
          ) : (
            <ProductPrice price={shippingFee} />
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4">
        <CouponInput coupon={coupon} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4">
        <span className="font-semibold">Tong cong</span>
        <ProductPrice price={total} />
      </div>

      <Link
        href="/checkout"
        className="mt-5 block rounded-md bg-zinc-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-800"
      >
        Thanh toan
      </Link>

      <p className="mt-3 text-center text-xs leading-5 text-zinc-500">
        Coupon se duoc giu trong gio hang va tinh lai khi dat hang.
      </p>
    </aside>
  );
}
