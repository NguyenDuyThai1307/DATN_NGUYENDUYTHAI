import { SearchSuggestions } from "@/components/layout/SearchSuggestions";
import Link from "next/link";
import { Heart, ShoppingCart, UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { MobileNav } from "@/components/layout/MobileNav";

export async function Header() {
  const user = await getCurrentUser();
  const cartCount = user ? (await prisma.cartItem.aggregate({ where: { cart: { userId: user.id } }, _sum: { quantity: true } }))._sum.quantity ?? 0 : 0;
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:gap-8">
        <Link href="/" className="inline-flex shrink-0 items-center gap-2.5" aria-label="Figure Shop — Trang chủ">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--brand-strong)] text-xl font-black text-white">F</span>
          <span className="text-sm font-black tracking-wider sm:text-lg">FIGURE SHOP<span className="hidden text-[10px] font-medium tracking-[0.18em] text-zinc-500 sm:block">GÓC NHỎ ĐAM MÊ</span></span>
        </Link>
        <SearchSuggestions />
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Link href={user ? "/account" : "/login"} aria-label={user ? "Tài khoản" : "Đăng nhập"} className="hidden size-11 place-items-center rounded-xl hover:bg-zinc-100 sm:grid"><UserRound size={21} aria-hidden="true" /></Link>
          <Link href="/wishlist" aria-label="Sản phẩm yêu thích" className="grid size-11 place-items-center rounded-xl hover:bg-rose-50"><Heart size={21} aria-hidden="true" /></Link>
          <Link href="/cart" aria-label={`Giỏ hàng, ${cartCount} sản phẩm`} className="relative grid size-11 place-items-center rounded-xl hover:bg-zinc-100"><ShoppingCart size={21} aria-hidden="true" />{cartCount > 0 && <span className="absolute right-0 top-0 min-w-5 rounded-full bg-[var(--brand-strong)] px-1 text-center text-[10px] font-bold leading-5 text-white">{cartCount > 99 ? "99+" : cartCount}</span>}</Link>
          <MobileNav isAuthenticated={Boolean(user)} />
        </div>
      </div>
      <div className="hidden border-t border-zinc-100 lg:block"><MegaMenu /></div>
    </header>
  );
}
