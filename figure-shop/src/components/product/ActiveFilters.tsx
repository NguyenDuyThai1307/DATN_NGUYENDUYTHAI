import Link from "next/link";

export function ActiveFilters({ params, categories, brands, pathname = "/products" }: {
  pathname?: string;
  params: Record<string, string | undefined>;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}) {
  const labels: Record<string, string | undefined> = {
    q: params.q ? `Tìm: ${params.q}` : undefined,
    categoryId: categories.find(c => c.id === params.categoryId)?.name,
    brandId: brands.find(b => b.id === params.brandId)?.name,
    type: params.type === "PREORDER" ? "Đặt trước" : params.type === "IN_STOCK" ? "Có sẵn" : undefined,
    minPrice: params.minPrice ? `Từ ${Number(params.minPrice).toLocaleString("vi-VN")} đ` : undefined,
    maxPrice: params.maxPrice ? `Đến ${Number(params.maxPrice).toLocaleString("vi-VN")} đ` : undefined,
  };
  const active = Object.entries(labels).filter(([, label]) => label);
  if (!active.length) return null;
  return <div aria-label="Bộ lọc đang áp dụng" className="mb-5 flex flex-wrap gap-2">
    {active.map(([key, label]) => {
      const query = new URLSearchParams(Object.entries(params).filter(([k,v]) => k !== key && k !== "page" && v !== undefined) as [string,string][]);
      return <Link key={key} href={query.size ? `${pathname}?${query}` : pathname} aria-label={`Bỏ bộ lọc ${label}`} className="inline-flex min-h-10 items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-3 text-xs font-medium text-blue-800">{label}<span aria-hidden="true">×</span></Link>;
    })}
    <Link href={pathname} className="inline-flex min-h-10 items-center px-2 text-xs font-semibold underline">Bỏ tất cả</Link>
  </div>;
}
