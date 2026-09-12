"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const figureGroups = [
  {
    label: "Mô hình tĩnh",
    href: "/collections/scale-figure",
    children: [
      ["Mô hình tỉ lệ", "/collections/scale-figure"],
      ["Mô hình giải thưởng", "/collections/prize-figure"],
      ["Tượng resin", "/collections/resin-statue"],
    ],
  },
  {
    label: "Mô hình có khớp",
    href: "/collections/action-figure",
    children: [
      ["Mô hình có khớp", "/collections/action-figure"],
      ["Nendoroid và mô hình chibi", "/collections/nendoroid"],
      ["Búp bê sưu tầm", "/collections/collectible-doll"],
    ],
  },
  {
    label: "Mô hình lắp ráp",
    href: "/collections/model-kit",
    children: [
      ["Bộ mô hình lắp ráp", "/collections/model-kit"],
      ["Mô hình mini và hộp mù", "/collections/mini-blind-box"],
    ],
  },
  {
    label: "Trạng thái sản phẩm",
    href: "/products",
    children: [
      ["Hàng có sẵn", "/products?type=IN_STOCK"],
      ["Hàng đặt trước", "/preorder"],
    ],
  },
  {
    label: "Thương hiệu",
    href: "/brands",
    children: [
      ["Bandai", "/products?q=Bandai"],
      ["Good Smile Company", "/products?q=Good Smile Company"],
      ["Kotobukiya", "/products?q=Kotobukiya"],
    ],
  },
] as const;

const navigation = [
  { href: "/", label: "Trang chủ", hasDropdown: false },
  { href: "/products", label: "Tất cả sản phẩm", hasDropdown: false },
  { href: "/preorder", label: "Preorder", hasDropdown: false },
  { href: "/news", label: "Tin tức", hasDropdown: true },
  { href: "/brands", label: "Thương hiệu", hasDropdown: false },
] as const;

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="mx-auto max-w-[1500px] px-6">
      <div className="flex h-12 items-center justify-center gap-1">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg px-3 text-[15px] font-bold text-zinc-950 transition hover:bg-zinc-100 hover:text-zinc-800"
        >
          Trang chủ
        </Link>

        <div
          className="relative"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={(event) => { if (event.target instanceof Element && event.target.closest("a")) setIsOpen(false); }}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false); }}
          onKeyDown={(event) => { if (event.key === "Escape") { setIsOpen(false); event.currentTarget.querySelector("button")?.focus(); } }}
        >
          <button
            type="button"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[15px] font-bold text-zinc-950 transition hover:bg-zinc-100 hover:text-zinc-800"
            style={{ fontWeight: 700 }}
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
          >
            Mô hình
            <ChevronDown size={16} aria-hidden="true" />
          </button>

          {isOpen ? (
            <div className="motion-menu absolute left-0 top-full z-50 w-80 rounded-xl border border-zinc-200 bg-white py-2 shadow-xl">
              {figureGroups.map((item) => (
                <div key={item.label} className="group/item relative">
                  <Link
                    href={item.href}
                    className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-rose-50 hover:text-zinc-950"
                  >
                    {item.label}
                    <ChevronRight size={15} aria-hidden="true" />
                  </Link>
                  <div className="invisible absolute left-full top-0 w-60 rounded-r-xl border border-zinc-200 bg-white py-2 opacity-0 shadow-xl transition group-hover/item:visible group-hover/item:opacity-100 group-focus-within/item:visible group-focus-within/item:opacity-100">
                    {item.children.map(([label, href]) => (
                      <Link
                        key={label}
                        href={href}
                        className="block px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-rose-50 hover:text-zinc-950"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {navigation.slice(1).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="inline-flex h-10 items-center gap-1 rounded-lg px-3 text-[15px] font-bold text-zinc-950 transition hover:bg-zinc-100 hover:text-zinc-800"
          >
            {item.label}

          </Link>
        ))}
      </div>
    </nav>
  );
}
