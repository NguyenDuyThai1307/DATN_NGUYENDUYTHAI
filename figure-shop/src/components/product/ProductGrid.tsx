import type { ComponentProps, ReactNode } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { RevealSection } from "@/components/home/RevealSection";

type ProductGridProps = {
  products: ComponentProps<typeof ProductCard>["product"][];
  emptyState?: ReactNode;
  className?: string;
};

const gridClassName =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5";

export function ProductGrid({
  products,
  emptyState,
  className,
}: ProductGridProps) {
  if (products.length === 0) {
    return emptyState ?? null;
  }

  return (
    <RevealSection key={products.map(product => product.id).join(",")} className={`${gridClassName}${className ? ` ${className}` : ""}`}>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </RevealSection>
  );
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
        >
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center justify-between gap-3 pt-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="size-11 shrink-0 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
