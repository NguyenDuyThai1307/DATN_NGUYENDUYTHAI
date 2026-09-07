import Link from "next/link";
import { ArrowRight } from "lucide-react";

type HomeSectionProps = {
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
  className?: string;
};

export function HomeSection({
  title,
  eyebrow,
  href,
  linkLabel = "Xem tất cả",
  children,
  className = "",
}: HomeSectionProps) {
  return (
    <section className={`py-7 sm:py-10 ${className}`}>
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          {eyebrow ? (
            <p className="mb-1 text-xs font-bold uppercase text-[var(--brand-strong)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-xl font-bold text-zinc-950 sm:text-2xl">{title}</h2>
        </div>

        {href ? (
          <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-strong)] hover:text-zinc-950">
            {linkLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
