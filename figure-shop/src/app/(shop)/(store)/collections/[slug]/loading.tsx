import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CollectionLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-56" />
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
          <ProductGridSkeleton />
        </section>
      </div>
    </main>
  );
}
