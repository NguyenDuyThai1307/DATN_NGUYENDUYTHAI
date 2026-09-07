import Link from "next/link";
import {
  Headphones,
  MapPinned,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { TopBar } from "@/components/layout/TopBar";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <TopBar isAuthenticated={Boolean(user)} />

      <div className="bg-[var(--header-yellow)]">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6 lg:py-4">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-3"
            aria-label="Figure Shop"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-zinc-950 bg-white text-xl font-black text-zinc-950 shadow-sm lg:h-16 lg:w-16 lg:text-2xl">
              F
            </span>
            <span className="hidden leading-none sm:block">
              <span className="block text-xl font-black tracking-[0.1em] text-zinc-950 lg:text-2xl">
                FIGURE
              </span>
              <span className="block text-xl font-black tracking-[0.1em] text-zinc-950 lg:text-2xl">
                SHOP
              </span>
            </span>
          </Link>

          <form
            action="/products"
            method="get"
            className="hidden min-w-0 flex-1 md:block"
          >
            <label htmlFor="site-search" className="sr-only">
              Tìm sản phẩm
            </label>
            <div className="relative">
              <input
                id="site-search"
                name="q"
                type="search"
                placeholder="Tìm kiếm mô hình, Nendoroid, mô hình tỉ lệ..."
                className="h-12 w-full rounded-lg border border-white/70 bg-white px-5 pr-14 text-sm text-zinc-800 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950/20 focus:ring-4 focus:ring-white/50"
              />
              <button
                type="submit"
                className="absolute inset-y-1 right-1 grid w-11 place-items-center rounded-md text-zinc-700 transition hover:bg-amber-100 hover:text-zinc-950"
                aria-label="Tìm kiếm"
                title="Tìm kiếm"
              >
                <Search size={23} aria-hidden="true" />
              </button>
            </div>
          </form>

          <div className="ml-auto hidden items-center justify-end gap-3 lg:flex">
            <a
              href="tel:0900000000"
              className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 font-bold leading-tight text-zinc-950 transition hover:bg-white/40"
            >
              <Headphones size={28} aria-hidden="true" />
              <span>
                <span className="block text-xs">Hotline</span>
                <span className="block text-base">0900.000.000</span>
              </span>
            </a>

            <Link
              href="/contact#stores"
              className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 font-bold leading-tight text-zinc-950 transition hover:bg-white/40"
            >
              <MapPinned size={27} aria-hidden="true" />
              <span>
                <span className="block text-xs">Hệ thống</span>
                <span className="block text-base">Cửa hàng</span>
              </span>
            </Link>

            <Link
              href={user ? "/account" : "/login"}
              title={user ? "Tài khoản" : "Đăng nhập"}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/25 text-zinc-950 transition hover:bg-white/60"
            >
              <UserRound size={24} aria-hidden="true" />
            </Link>

            <Link
              href="/cart"
              title="Giỏ hàng"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/25 text-zinc-950 transition hover:bg-white/60"
            >
              <ShoppingCart size={25} aria-hidden="true" />
            </Link>
          </div>

          <div className="ml-auto lg:hidden">
            <MobileNav isAuthenticated={Boolean(user)} />
          </div>
        </div>
      </div>

      <div className="hidden border-t border-black/5 bg-[var(--header-yellow)] lg:block">
        <MegaMenu />
      </div>
    </header>
  );
}
