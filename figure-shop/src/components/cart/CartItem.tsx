import Link from "next/link";
import {
  calculateLinePricing,
  isPromotionActive,
} from "@/services/pricing.service";
import { ProductPrice } from "@/components/product/ProductPrice";
import { CartQuantityControl } from "@/components/cart/CartQuantityControl";

type CartItemProps = {
  item: {
    id: string;
    quantity: number;
    product: {
      name: string;
      slug: string;
      price: number;
      brand?: {
        name: string;
      } | null;
      promotion?: {
        type: "PERCENTAGE" | "FIXED_AMOUNT";
        value: number;
        startsAt: Date;
        endsAt: Date;
        isActive: boolean;
      } | null;
      images: {
        alt: string | null;
      }[];
    };
  };
};

export function CartItem({ item }: CartItemProps) {
  const activePromotion =
    item.product.promotion && isPromotionActive(item.product.promotion)
      ? item.product.promotion
      : null;

  const linePricing = calculateLinePricing({
    unitPrice: item.product.price,
    quantity: item.quantity,
    promotion: activePromotion,
  });

  return (
    <div className="grid gap-4 rounded-md border border-zinc-200 bg-white p-4 sm:grid-cols-[120px_1fr]">
      <div className="flex aspect-square items-center justify-center rounded bg-zinc-100 px-4 text-center text-xs font-medium text-zinc-500">
        {item.product.images[0]?.alt ?? item.product.name}
      </div>

      <div className="flex flex-col justify-between gap-4">
        <div>
          {item.product.brand ? (
            <p className="text-xs font-medium uppercase text-zinc-500">
              {item.product.brand.name}
            </p>
          ) : null}

          <Link
            href={`/products/${item.product.slug}`}
            className="mt-1 block font-semibold hover:text-red-600"
          >
            {item.product.name}
          </Link>

          {activePromotion ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              {activePromotion.type === "PERCENTAGE"
                ? `Giam ${activePromotion.value}%`
                : `Giam ${activePromotion.value.toLocaleString("vi-VN")} d`}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4">
          <CartQuantityControl itemId={item.id} quantity={item.quantity} />

          <ProductPrice
            price={linePricing.finalTotal}
            originalPrice={
              activePromotion
                ? item.product.price * item.quantity
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}