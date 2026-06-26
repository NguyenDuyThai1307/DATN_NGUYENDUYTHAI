import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      </div>

      <div className="mt-6">
        <ProductGridSkeleton />
      </div>
    </main>
  );
}
