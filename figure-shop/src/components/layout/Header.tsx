import Link from "next/link";
import { Search, ShoppingCart, UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { MobileNav } from "@/components/layout/MobileNav";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:gap-8">
        <Link href="/" className="inline-flex shrink-0 items-center gap-2.5" aria-label="Figure Shop — Trang chủ">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--brand-strong)] text-xl font-black text-white">F</span>
          <span className="text-sm font-black tracking-wider sm:text-lg">FIGURE SHOP<span className="hidden text-[10px] font-medium tracking-[0.18em] text-zinc-500 sm:block">GÓC NHỎ ĐAM MÊ</span></span>
        </Link>
        <form action="/products" method="get" role="search" className="order-last w-full md:order-none md:min-w-0 md:flex-1">
          <label htmlFor="site-search" className="sr-only">Tìm sản phẩm</label>
          <div className="relative">
            <input id="site-search" name="q" type="search" placeholder="Tìm mô hình, nhân vật, thương hiệu…" className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-4 pr-12 text-sm outline-none transition focus:border-[var(--brand-strong)] focus:bg-white" />
            <button type="submit" aria-label="Tìm kiếm" className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-xl text-zinc-600 hover:text-[var(--brand-strong)]"><Search size={20} aria-hidden="true" /></button>
          </div>
        </form>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Link href={user ? "/account" : "/login"} aria-label={user ? "Tài khoản" : "Đăng nhập"} className="hidden size-11 place-items-center rounded-xl hover:bg-zinc-100 sm:grid"><UserRound size={21} aria-hidden="true" /></Link>
          <Link href="/cart" aria-label="Giỏ hàng" className="grid size-11 place-items-center rounded-xl hover:bg-zinc-100"><ShoppingCart size={21} aria-hidden="true" /></Link>
          <MobileNav isAuthenticated={Boolean(user)} />
        </div>
      </div>
      <div className="hidden border-t border-zinc-100 lg:block"><MegaMenu /></div>
    </header>
  );
}
