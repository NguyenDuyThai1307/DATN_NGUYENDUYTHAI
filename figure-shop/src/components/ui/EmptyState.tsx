import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: {
    href: string;
    label: string;
  };
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
          {icon}
        </div>
      ) : null}

      <h2 className="text-base font-bold text-zinc-950">{title}</h2>

      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
          {description}
        </p>
      ) : null}

      {action ? (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
