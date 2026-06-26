import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductPaginationProps = {
  pathname: string;
  currentPage: number;
  pageCount: number;
  searchParams: Record<string, string | undefined>;
};

function getPageHref(
  pathname: string,
  searchParams: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") {
      params.set(key, value);
    }
  });

  params.set("page", String(page));

  return `${pathname}?${params.toString()}`;
}

export function ProductPagination({
  pathname,
  currentPage,
  pageCount,
  searchParams,
}: ProductPaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Phan trang san pham">
      <Link
        href={getPageHref(pathname, searchParams, Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 ${
          currentPage === 1 ? "pointer-events-none opacity-40" : "hover:bg-rose-50"
        }`}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </Link>

      {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
        <Link
          key={page}
          href={getPageHref(pathname, searchParams, page)}
          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-semibold ${
            page === currentPage
              ? "bg-[var(--brand-strong)] text-white"
              : "border border-zinc-300 text-zinc-700 hover:bg-rose-50"
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={getPageHref(pathname, searchParams, Math.min(pageCount, currentPage + 1))}
        aria-disabled={currentPage === pageCount}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 ${
          currentPage === pageCount ? "pointer-events-none opacity-40" : "hover:bg-rose-50"
        }`}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </nav>
  );
}
