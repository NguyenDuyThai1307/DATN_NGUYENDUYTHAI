"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const figureGroups = [
  {
    label: "Mo Hinh PVC",
    href: "/products?q=PVC",
    children: [
      ["Scale Figure", "/collections/scale-figure"],
      ["Nendoroid", "/products?q=Nendoroid"],
      ["Figma", "/products?q=Figma"],
    ],
  },
  {
    label: "Mo Hinh Resin",
    href: "/products?q=Resin",
    children: [
      ["GK Figure", "/products?q=GK"],
      ["Statue", "/products?q=Statue"],
    ],
  },
  {
    label: "Hang Dat Truoc",
    href: "/preorder",
    children: [
      ["Pre-order moi", "/preorder"],
      ["Sap phat hanh", "/products?type=PREORDER"],
    ],
  },
  {
    label: "Hang San Xuat",
    href: "/brands",
    children: [
      ["Bandai", "/products?q=Bandai"],
      ["Good Smile Company", "/products?q=Good Smile Company"],
    ],
  },
  {
    label: "San Pham Noi Bat",
    href: "/products",
    children: [
      ["Flash sale", "/products?sort=price_asc"],
      ["Hang co san", "/products?type=IN_STOCK"],
    ],
  },
] as const;

const navigation = [
  { href: "/", label: "Trang chu", hasDropdown: false },
  { href: "/products", label: "San Pham Khac", hasDropdown: true },
  { href: "/products?sort=price_asc", label: "Khuyen mai", hasDropdown: true },
  { href: "/guide", label: "Huong Dan", hasDropdown: true },
  { href: "/news", label: "Tin Tuc", hasDropdown: true },
  { href: "/contact", label: "Lien he", hasDropdown: false },
  { href: "/collections", label: "Khac", hasDropdown: true },
] as const;

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[var(--header-yellow)]">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="h-12 content-center text-base font-black text-white transition hover:text-zinc-950"
        >
          Trang chu
        </Link>

        <div
          className="relative"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="inline-flex h-12 items-center gap-1.5 text-base font-black text-zinc-900 transition hover:text-white"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
          >
            Mo Hinh / Figure
            <ChevronDown size={16} aria-hidden="true" />
          </button>

          {isOpen ? (
            <div className="absolute left-0 top-full z-50 w-80 rounded-b-lg border border-zinc-200 bg-white py-2 shadow-xl">
              <div className="absolute -top-8 left-0 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white">
                Mo Hinh / Figure
              </div>
              {figureGroups.map((item) => (
                <div key={item.label} className="group/item relative">
                  <Link
                    href={item.href}
                    className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-amber-50 hover:text-zinc-950"
                  >
                    {item.label}
                    <ChevronRight size={15} aria-hidden="true" />
                  </Link>
                  <div className="invisible absolute left-full top-0 w-60 rounded-r-lg border border-zinc-200 bg-white py-2 opacity-0 shadow-xl transition group-hover/item:visible group-hover/item:opacity-100">
                    {item.children.map(([label, href]) => (
                      <Link
                        key={label}
                        href={href}
                        className="block px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-amber-50 hover:text-zinc-950"
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
            className="inline-flex h-12 items-center gap-1 text-base font-black text-white transition hover:text-zinc-950"
          >
            {item.label}
            {item.hasDropdown ? <ChevronDown size={15} aria-hidden="true" /> : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}
