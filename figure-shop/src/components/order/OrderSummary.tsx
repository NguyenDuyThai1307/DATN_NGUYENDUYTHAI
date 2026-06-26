import { ProductPrice } from "@/components/product/ProductPrice";

type OrderSummaryProps = {
  subtotal: number;
  productDiscountAmount: number;
  couponDiscountAmount: number;
  couponCode?: string | null;
  shippingFee: number;
  total: number;
};

export function OrderSummary({
  subtotal,
  productDiscountAmount,
  couponDiscountAmount,
  couponCode,
  shippingFee,
  total,
}: OrderSummaryProps) {
  return (
    <div className="mt-5 space-y-3 border-t border-zinc-200 pt-4 text-sm">
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
          <span className="text-zinc-600">
            Giam coupon {couponCode ? `(${couponCode})` : ""}
          </span>
          <span className="font-medium text-red-600">
            -{couponDiscountAmount.toLocaleString("vi-VN")} d
          </span>
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

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
        <span className="font-medium">Tong cong</span>
        <ProductPrice price={total} />
      </div>
    </div>
  );
}