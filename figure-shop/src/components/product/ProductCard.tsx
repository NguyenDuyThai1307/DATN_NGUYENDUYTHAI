import Link from "next/link";
import {
  calculateLinePricing,
  isPromotionActive,
} from "@/services/pricing.service";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Badge } from "@/components/ui/Badge";

type ProductCardProps = {
  product: {
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
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-md border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="relative aspect-square bg-zinc-100">
        <div className="flex h-full items-center justify-center bg-zinc-100 px-6 text-center text-sm font-medium text-zinc-500">
          {firstImage?.alt ?? product.name}
        </div>

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

      <div className="space-y-2 p-4">
        {product.brand ? (
          <p className="text-xs font-medium uppercase text-zinc-500">
            {product.brand.name}
          </p>
        ) : null}

        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-950">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-3">
          <ProductPrice
            price={linePricing.finalUnitPrice}
            originalPrice={activePromotion ? product.price : undefined}
          />

          <span className="text-xs text-zinc-500">
            {product.type === "PREORDER" ? "Dat truoc" : `Con ${product.stock}`}
          </span>
        </div>
      </div>
    </Link>
  );
}