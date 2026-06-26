import Link from "next/link";
import Image from "next/image";
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
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square bg-zinc-100">
        <Link href={`/products/${product.slug}`} className="block h-full">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={firstImage.alt ?? product.name}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-100 px-4 text-center text-xs font-semibold leading-5 text-zinc-500 sm:px-6 sm:text-sm">
              Chua co anh cho {product.name}
            </div>
          )}
        </Link>

        <Badge
          variant={product.type === "PREORDER" ? "warning" : "success"}
          className="absolute left-3 top-3 bg-white shadow-sm"
        >
          {product.type === "PREORDER" ? "Pre-order" : "Co san"}
        </Badge>

        {activePromotion ? (
          <Badge
            variant="danger"
            className="absolute right-3 top-3 shadow-sm"
          >
            {activePromotion.type === "PERCENTAGE"
              ? `-${activePromotion.value}%`
              : `-${activePromotion.value.toLocaleString("vi-VN")} d`}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-2 p-3.5 sm:p-4">
        {product.brand ? (
          <p className="text-xs font-medium uppercase text-zinc-500">
            {product.brand.name}
          </p>
        ) : null}

        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-zinc-950 transition group-hover:text-[var(--brand-strong)]">
            {product.name}
          </h3>
        </Link>

        <div className="flex min-h-12 flex-col justify-between gap-1">
          <ProductPrice
            price={linePricing.finalUnitPrice}
            originalPrice={activePromotion ? product.price : undefined}
          />

          <span className="text-xs text-zinc-500">
            {product.type === "PREORDER" ? "Dat truoc" : `Con ${product.stock}`}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Link
            href={`/products/${product.slug}`}
            className="text-xs font-bold text-zinc-600 transition hover:text-[var(--brand-strong)]"
          >
            Chi tiet
          </Link>
          <AddToCartButton
            productId={product.id}
            label="Them gio"
            className="ml-auto px-2.5 py-1.5 text-xs"
          />
        </div>
      </div>
    </article>
  );
}
