import type { ComponentProps } from "react";
import { ProductCard } from "@/components/product/ProductCard";

type ProductShelfProps = {
  products: ComponentProps<typeof ProductCard>["product"][];
  compact?: boolean;
};

export function ProductShelf({ products, compact = false }: ProductShelfProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        Chưa có sản phẩm phù hợp cho khu vực này.
      </div>
    );
  }

  return (
    <div className={`product-shelf grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ${compact ? "home-product-grid" : ""}`}>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} compact={compact} />
      ))}
    </div>
  );
}
