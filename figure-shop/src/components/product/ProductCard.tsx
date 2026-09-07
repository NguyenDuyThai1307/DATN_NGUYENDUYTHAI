import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import {
  calculateLinePricing,
  isPromotionActive,
} from "@/services/pricing.service";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    type: "IN_STOCK" | "PREORDER";
    stock: number;
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
      url: string;
      alt: string | null;
    }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images[0];

  const activePromotion =
    product.promotion && isPromotionActive(product.promotion)
      ? product.promotion
      : null;

  const linePricing = calculateLinePricing({
    unitPrice: product.price,
    quantity: 1,
    promotion: activePromotion,
  });

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Xem chi tiết ${product.name}`}
      />

      <div className="relative aspect-square bg-zinc-100">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.alt ?? product.name}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-100 px-4 text-center text-xs font-semibold leading-5 text-zinc-500 sm:px-6 sm:text-sm">
            Chưa có ảnh cho {product.name}
          </div>
        )}

        <Badge
          variant={product.type === "PREORDER" ? "warning" : "success"}
          className="absolute left-3 top-3 bg-white shadow-sm"
        >
          {product.type === "PREORDER" ? "Pre-order" : "Có sẵn"}
        </Badge>

        {activePromotion ? (
          <Badge
            variant="danger"
            className="absolute right-3 top-3 shadow-sm"
          >
            {activePromotion.type === "PERCENTAGE"
              ? `-${activePromotion.value}%`
              : `-${activePromotion.value.toLocaleString("vi-VN")} đ`}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col space-y-2 p-3.5 sm:p-4">
        {product.brand ? (
          <p className="text-xs font-medium uppercase text-zinc-500">
            {product.brand.name}
          </p>
        ) : null}

        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-zinc-950 transition group-hover:text-[var(--brand-strong)]">
          {product.name}
        </h3>

        <div className="flex min-h-12 flex-col justify-between gap-1">
          <ProductPrice
            price={linePricing.finalUnitPrice}
            originalPrice={activePromotion ? product.price : undefined}
          />

          <span className="text-xs text-zinc-500">
            {product.type === "PREORDER" ? "Đặt trước" : `Còn ${product.stock}`}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-xs font-bold text-zinc-600 transition group-hover:text-[var(--brand-strong)]">
            Xem chi tiết
          </span>

          <div className="relative z-20">
            <AddToCartButton
              productId={product.id}
              label="Thêm giỏ"
              ariaLabel={`Thêm ${product.name} vào giỏ hàng`}
              showMessage={false}
              className="grid size-9 place-items-center rounded-full border border-zinc-300 bg-white p-0 text-zinc-900 shadow-sm hover:border-[var(--brand-strong)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)]"
            >
              <ShoppingCart size={17} aria-hidden="true" />
            </AddToCartButton>
          </div>
        </div>
      </div>
    </article>
  );
}
