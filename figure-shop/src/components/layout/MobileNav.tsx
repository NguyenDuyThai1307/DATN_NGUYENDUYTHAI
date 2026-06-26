"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";

type MobileNavProps = {
  isAuthenticated: boolean;
};

const navigationItems = [
  { href: "/products", label: "San pham" },
  { href: "/preorder", label: "Pre-order" },
  { href: "/collections", label: "Danh muc" },
  { href: "/brands", label: "Thuong hieu" },
  { href: "/guide", label: "Huong dan" },
  { href: "/news", label: "Tin tuc" },
  { href: "/contact", label: "Lien he" },
  { href: "/cart", label: "Gio hang" },
];

export function MobileNav({ isAuthenticated }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
        aria-label={isOpen ? "Dong menu" : "Mo menu"}
        aria-expanded={isOpen}
        title={isOpen ? "Dong menu" : "Mo menu"}
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-md border border-zinc-200 bg-white p-2 shadow-lg">
          <form action="/products" method="get" className="mb-2">
            <label htmlFor="mobile-site-search" className="sr-only">
              Tim san pham
            </label>
            <div className="relative">
              <input
                id="mobile-site-search"
                name="q"
                type="search"
                placeholder="Tim san pham"
                className="h-10 w-full rounded-md border border-zinc-300 px-3 pr-9 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-rose-100"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 grid w-9 place-items-center text-zinc-500"
                aria-label="Tim kiem"
                title="Tim kiem"
              >
                <Search size={17} aria-hidden="true" />
              </button>
            </div>
          </form>

          <nav className="grid">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-2 border-t border-zinc-200 pt-2">
            {isAuthenticated ? (
              <div className="grid gap-1">
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="rounded px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  Tai khoan
                </Link>

                <div className="px-3 py-1">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="grid">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  Dang nhap
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="rounded px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  Dang ky
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
