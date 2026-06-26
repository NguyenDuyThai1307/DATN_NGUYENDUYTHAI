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

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 bg-[var(--header-yellow)] shadow-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-x-4 px-4 py-3 sm:px-6 lg:grid-cols-[260px_1fr_auto] lg:gap-x-6 lg:py-0">
        <Link
          href="/"
          className="row-span-2 inline-flex shrink-0 items-center gap-3"
          aria-label="Figure Shop"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-zinc-950 bg-white text-xl font-black text-zinc-950 lg:h-20 lg:w-20 lg:text-3xl">
            F
          </span>
          <span className="hidden text-xl font-black tracking-[0.08em] text-zinc-950 sm:inline lg:text-2xl">
            FIGURE SHOP
          </span>
        </Link>

        <form
          action="/products"
          method="get"
          className="col-span-1 hidden min-w-0 md:block lg:pt-4"
        >
          <label htmlFor="site-search" className="sr-only">
            Tim san pham
          </label>
          <div className="relative">
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Tu khoa..."
              className="h-12 w-full rounded-md border-0 bg-white px-5 pr-12 text-sm outline-none transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950/20"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-zinc-700 transition hover:text-zinc-950"
              aria-label="Tim kiem"
              title="Tim kiem"
            >
              <Search size={24} aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="hidden items-center justify-end gap-5 lg:flex lg:pt-4">
          <a
            href="tel:0900000000"
            className="inline-flex items-center gap-2 font-bold leading-tight text-white transition hover:text-zinc-950"
          >
            <Headphones size={31} aria-hidden="true" />
            <span>
              <span className="block text-sm">Hotline:</span>
              <span className="block text-lg">0900.000.000</span>
            </span>
          </a>

          <Link
            href="/contact#stores"
            className="inline-flex items-center gap-2 font-bold leading-tight text-white transition hover:text-zinc-950"
          >
            <MapPinned size={29} aria-hidden="true" />
            <span>
              <span className="block text-sm">He thong</span>
              <span className="block text-lg">Cua hang</span>
            </span>
          </Link>

          <Link
            href={user ? "/account" : "/login"}
            title={user ? "Tai khoan" : "Dang nhap"}
            className="grid h-11 w-11 place-items-center rounded-full text-white transition hover:bg-white/25 hover:text-zinc-950"
          >
            <UserRound size={27} aria-hidden="true" />
          </Link>

          <Link
            href="/cart"
            title="Gio hang"
            className="grid h-11 w-11 place-items-center rounded-full text-white transition hover:bg-white/25 hover:text-zinc-950"
          >
            <ShoppingCart size={29} aria-hidden="true" />
          </Link>
        </div>

        <div className="col-start-3 row-start-1 justify-self-end lg:hidden">
          <MobileNav isAuthenticated={Boolean(user)} />
        </div>

        <div className="col-span-2 col-start-2 hidden lg:block">
          <MegaMenu />
        </div>
      </div>
    </header>
  );
}
