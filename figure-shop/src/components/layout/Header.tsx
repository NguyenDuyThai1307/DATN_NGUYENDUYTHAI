import Link from "next/link";
import { Gift, ShoppingCart, UserRound } from "lucide-react";
import { SearchSuggestions } from "./SearchSuggestions";
import { BrandLogo } from "./BrandLogo";
import { HeaderWishlist } from "./HeaderWishlist";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function Header() {
  const user = await getCurrentUser();
  const cartCount = user ? (await prisma.cartItem.aggregate({ where: { cart: { userId: user.id } }, _sum: { quantity: true } }))._sum.quantity ?? 0 : 0;
  return <header className="store-header sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
    <div className="mx-auto flex max-w-[1560px] flex-wrap items-center gap-4 px-4 py-3 sm:px-6 lg:gap-10">
      <Link href="/" aria-label="Figure Shop — Trang chủ"><BrandLogo /></Link>
      <SearchSuggestions />
      <div className="ml-auto flex items-center gap-4 lg:gap-7">
        <Link href={user ? "/account" : "/login"} className="hidden items-center gap-2 sm:flex"><UserRound size={23} /><span className="hidden text-xs lg:block"><strong className="block">Tài khoản</strong><span className="block max-w-28 truncate text-zinc-500">{user?.name || (user ? "Thông tin của bạn" : "Đăng nhập / Đăng ký")}</span></span></Link>
        <HeaderWishlist />
        <Link href="/cart" aria-label={`Giỏ hàng, ${cartCount} sản phẩm`} className="relative flex min-h-11 items-center gap-2"><ShoppingCart size={23} /><span className="hidden text-xs font-bold xl:block">Giỏ hàng</span><span className="absolute -right-2 -top-0.5 min-w-4 rounded-full bg-[var(--brand)] px-1 text-center text-[10px] leading-4 text-white">{cartCount > 99 ? "99+" : cartCount}</span></Link>
        <MobileNav isAuthenticated={Boolean(user)} />
      </div>
    </div>
    <div className="hidden border-t border-zinc-100 lg:block">
      <div className="store-navigation mx-auto max-w-[1560px] px-6">
        <MegaMenu />
        <Link href="/#offers" className="store-navigation-offer flex items-center gap-2 text-xs font-bold text-[var(--brand)]"><Gift size={18} />Ưu đãi hôm nay</Link>
      </div>
    </div>
  </header>;
}
