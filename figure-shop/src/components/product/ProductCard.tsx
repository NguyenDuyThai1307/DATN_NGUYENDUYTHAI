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
import { WishlistButton } from "@/components/product/Wishlist";

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
    product.type === "IN_STOCK" && product.promotion && isPromotionActive(product.promotion)
      ? product.promotion
      : null;

  const linePricing = calculateLinePricing({
    unitPrice: product.price,
    quantity: 1,
    promotion: activePromotion,
  });

  return (
    <article className="product-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white focus-within:ring-2 focus-within:ring-[var(--brand-strong)]">
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
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="product-card-image object-contain p-3"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-100 px-4 text-center text-xs font-semibold leading-5 text-zinc-500 sm:px-6 sm:text-sm">
            Chưa có ảnh cho {product.name}
          </div>
        )}

        <div className="absolute inset-x-2 top-2 flex flex-wrap items-start justify-between gap-1.5 sm:inset-x-3 sm:top-3">
        <Badge
          variant={product.type === "PREORDER" ? "warning" : "success"}
          className="bg-white shadow-sm"
        >
          {product.type === "PREORDER" ? "Pre-order" : product.stock > 0 ? "Có sẵn" : "Hết hàng"}
        </Badge>

        {activePromotion ? (
          <Badge
            variant="danger"
            className="shadow-sm"
          >
            {activePromotion.type === "PERCENTAGE"
              ? `Giảm ${activePromotion.value}%`
              : `Giảm ${activePromotion.value.toLocaleString("vi-VN")} đ`}
          </Badge>
        ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-2 p-3.5 sm:p-4">
        <p className="line-clamp-1 h-4 text-xs font-medium uppercase text-zinc-500">{product.brand?.name ?? "Figure Shop"}</p>

        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-zinc-950 transition group-hover:text-[var(--brand-strong)]">
          {product.name}
        </h3>

        <div className="flex min-h-24 flex-col gap-1">
          <ProductPrice
            price={linePricing.finalUnitPrice}
            originalPrice={activePromotion ? product.price : undefined}
          />

          {linePricing.finalUnitPrice < product.price ? (
            <span className="text-xs font-semibold text-[var(--brand-strong)]">
              Tiết kiệm {(product.price - linePricing.finalUnitPrice).toLocaleString("vi-VN")} đ
            </span>
          ) : null}

          <span className="text-xs text-zinc-500">
            {product.type === "PREORDER" ? "Đặt trước" : `Còn ${product.stock}`}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <WishlistButton productId={product.id} name={product.name} />
          <div className="relative z-20">
            <AddToCartButton
              productId={product.id}
              label="Thêm giỏ"
              ariaLabel={`Thêm ${product.name} vào giỏ hàng`}
              showMessage={false}
              disabled={product.type === "IN_STOCK" && product.stock <= 0}
              className="product-card-cart"
            >
              <ShoppingCart size={17} aria-hidden="true" />
            </AddToCartButton>
          </div>
        </div>
      </div>
    </article>
  );
}
