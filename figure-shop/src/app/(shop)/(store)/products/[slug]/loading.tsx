import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return <main aria-label="Đang tải sản phẩm" className="mx-auto max-w-7xl px-4 py-7 sm:px-6"><Skeleton className="h-5 w-48" /><div className="mt-7 grid gap-8 lg:grid-cols-2"><Skeleton className="aspect-square rounded-2xl" /><div className="space-y-5"><Skeleton className="h-10 w-4/5" /><Skeleton className="h-8 w-36" /><Skeleton className="h-44" /><Skeleton className="h-12" /></div></div></main>;
}
