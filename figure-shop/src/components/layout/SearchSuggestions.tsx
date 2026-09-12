"use client";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Suggestion = { id: string; name: string; slug: string; image: string | null; price: number; type: string };
export function SearchSuggestions() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ query: string; products: Suggestion[]; error?: boolean } | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const container = useRef<HTMLFormElement>(null);
  const id = useId();
  const router = useRouter();
  const term = query.trim();
  const products = result?.query === term ? result.products : [];
  const loading = Boolean(term && result?.query !== term);
  const visible = open && Boolean(term);
  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/suggestions?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        if (!controller.signal.aborted) setResult({ query: term, products: data.products });
      } catch {
        if (!controller.signal.aborted) setResult({ query: term, products: [], error: true });
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [term]);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return <form ref={container} action="/products" method="get" role="search" className="relative order-last w-full md:order-none md:min-w-0 md:flex-1"
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onSubmit={() => setOpen(false)}>
    <label htmlFor={id} className="sr-only">Tìm sản phẩm</label>
    <input id={id} name="q" type="search" role="combobox" aria-autocomplete="list" aria-expanded={visible} aria-controls={`${id}-results`} aria-activedescendant={visible && active >= 0 && products[active] ? `${id}-${active}` : undefined}
      autoComplete="off" maxLength={100} value={query} onChange={event => { setQuery(event.target.value); setOpen(true); setActive(-1); }} onFocus={() => setOpen(true)}
      onKeyDown={event => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === "Escape") { setOpen(false); setActive(-1); }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive(index => products.length ? (index < 0 ? (event.key === "ArrowDown" ? 0 : products.length - 1) : (index + (event.key === "ArrowDown" ? 1 : -1) + products.length) % products.length) : -1); }
        if (event.key === "Enter" && visible && active >= 0 && products[active]) { event.preventDefault(); setOpen(false); router.push(`/products/${products[active].slug}`); }
      }} placeholder="Tìm mô hình, nhân vật, thương hiệu…" className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-4 pr-12 text-sm outline-none transition focus:border-[var(--brand-strong)] focus:bg-white" />
    <button type="submit" aria-label="Tìm kiếm" className="absolute right-0 top-0 grid size-11 place-items-center rounded-xl text-zinc-600"><Search size={20} /></button>
    {visible && <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
      <p role="status" className="px-4 py-3 text-xs text-zinc-500">{loading ? "Đang tìm sản phẩm…" : result?.error ? "Chưa tải được gợi ý. Nhấn Enter để tìm kiếm." : products.length ? "Sản phẩm gợi ý" : "Không tìm thấy sản phẩm phù hợp."}</p>
      <ul id={`${id}-results`} role="listbox" aria-label="Sản phẩm gợi ý" className="max-h-[50dvh] overflow-y-auto">
        {products.map((product, index) => <li id={`${id}-${index}`} key={product.id} role="option" aria-selected={active === index}>
          <Link href={`/products/${product.slug}`} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 hover:bg-rose-50 ${active === index ? "bg-rose-50" : ""}`}>
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-zinc-50">{product.image && <Image src={product.image} alt="" fill sizes="48px" className="object-contain" />}</span>
            <span className="min-w-0"><span className="block line-clamp-2 text-sm font-semibold">{product.name}</span><span className="mt-1 block text-xs font-semibold text-[var(--brand-strong)]">{product.price.toLocaleString("vi-VN")} đ{product.type === "PREORDER" ? " · Đặt trước" : ""}</span></span>
          </Link>
        </li>)}
      </ul>
      <Link href={`/products?q=${encodeURIComponent(term)}`} onClick={() => setOpen(false)} className="block border-t border-zinc-100 px-4 py-3 text-center text-sm font-semibold text-[var(--brand-strong)]">Xem tất cả kết quả</Link>
    </div>}
  </form>;
}
