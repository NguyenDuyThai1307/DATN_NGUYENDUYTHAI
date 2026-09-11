import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return <main aria-label="Đang tải nội dung" className="mx-auto max-w-[1500px] space-y-8 px-4 py-6 sm:px-6"><Skeleton className="h-[440px] rounded-3xl" /><Skeleton className="h-8 w-56" /><ProductGridSkeleton /></main>;
}
