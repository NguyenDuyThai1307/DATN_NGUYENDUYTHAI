"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";

type MobileNavProps = {
  isAuthenticated: boolean;
};

const navigationItems = [
  { href: "/products", label: "Sản phẩm" },
  { href: "/preorder", label: "Pre-order" },
  { href: "/collections", label: "Danh mục" },
  { href: "/brands", label: "Thương hiệu" },
  { href: "/guide", label: "Hướng dẫn" },
  { href: "/news", label: "Tin tức" },
  { href: "/contact", label: "Liên hệ" },
  { href: "/cart", label: "Giỏ hàng" },
];

export function MobileNav({ isAuthenticated }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
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
        if (containerRef.current?.contains(document.activeElement)) {
          containerRef.current.querySelector("button")?.focus();
        }
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
        aria-label={isOpen ? "Đóng menu" : "Mở menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        title={isOpen ? "Đóng menu" : "Mở menu"}
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      {isOpen ? (
        <div id="mobile-navigation" className="motion-menu absolute right-0 top-full z-50 mt-2 max-h-[70dvh] w-64 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
          <form action="/products" method="get" className="mb-2">
            <label htmlFor="mobile-site-search" className="sr-only">
              Tìm sản phẩm
            </label>
            <div className="relative">
              <input
                id="mobile-site-search"
                name="q"
                type="search"
                placeholder="Tìm sản phẩm"
                className="h-10 w-full rounded-md border border-zinc-300 px-3 pr-9 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-rose-100"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 grid w-9 place-items-center text-zinc-500"
                aria-label="Tìm kiếm"
                title="Tìm kiếm"
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
                  Tài khoản
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
                  Đăng nhập
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="rounded px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
