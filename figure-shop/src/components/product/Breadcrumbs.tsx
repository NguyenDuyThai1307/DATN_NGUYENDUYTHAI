import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 ? <ChevronRight size={15} aria-hidden="true" /> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--brand-strong)]">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-zinc-700">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
