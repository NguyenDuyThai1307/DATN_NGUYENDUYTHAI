import type { ComponentProps } from "react";
import { ProductCard } from "@/components/product/ProductCard";

type ProductShelfProps = {
  products: ComponentProps<typeof ProductCard>["product"][];
};

export function ProductShelf({ products }: ProductShelfProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        Chua co san pham phu hop cho khu vuc nay.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
