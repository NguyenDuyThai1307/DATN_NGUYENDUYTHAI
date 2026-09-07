import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type AuthPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthPageShell({
  title,
  description,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <section className="w-full rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase text-red-600">
          Figure Shop
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>

        <p className="mt-3 text-zinc-600">{description}</p>

        {children}

        <div className="mt-6 border-t border-zinc-200 pt-5">
          <div className="text-center text-sm text-zinc-600">{footer}</div>

          <div className="mt-5 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Về trang chủ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}