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
          Bước tiếp theo
        </p>
        <h2 className="mt-1 text-lg font-bold text-zinc-950">
          Tóm tắt đơn hàng
        </h2>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Tạm tính</span>
          <ProductPrice price={subtotal} />
        </div>

        {productDiscountAmount > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Giảm sản phẩm</span>
            <span className="font-medium text-red-600">
              -{productDiscountAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>
        ) : null}

        {couponDiscountAmount > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Giảm coupon</span>
            <span className="font-medium text-red-600">
              -{couponDiscountAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>
        ) : null}

        {discountAmount === 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Giảm giá</span>
            <span className="font-medium text-zinc-950">-0 đ</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Phí giao hàng</span>
          {shippingFee === 0 ? (
            <span className="font-medium text-emerald-700">Miễn phí</span>
          ) : (
            <ProductPrice price={shippingFee} />
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4">
        <CouponInput coupon={coupon} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4">
        <span className="font-semibold">Tổng cộng</span>
        <ProductPrice price={total} />
      </div>

      <Link
        href="/checkout"
        className="mt-5 block rounded-md bg-zinc-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-800"
      >
        Thanh toán
      </Link>

      <p className="mt-3 text-center text-xs leading-5 text-zinc-500">
        Coupon sẽ được giữ trong giỏ hàng và tính lại khi đặt hàng.
      </p>
    </aside>
  );
}
