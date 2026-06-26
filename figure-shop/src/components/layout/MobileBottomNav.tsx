import Link from "next/link";
import { Home, LayoutGrid, MessageCircle, ShoppingBag, UserRound } from "lucide-react";

type MobileBottomNavProps = {
  isAuthenticated: boolean;
};

const items = [
  { href: "/", label: "Trang chu", icon: Home },
  { href: "/collections", label: "Danh muc", icon: LayoutGrid },
  { href: "/contact", label: "Lien he", icon: MessageCircle },
] as const;

export function MobileBottomNav({ isAuthenticated }: MobileBottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(24,24,27,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.label} href={item.href} className="grid min-h-12 place-items-center gap-0.5 text-[10px] font-medium text-zinc-600 transition hover:text-[var(--brand-strong)]">
              <Icon size={19} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
        <Link href={isAuthenticated ? "/account" : "/login"} className="grid min-h-12 place-items-center gap-0.5 text-[10px] font-medium text-zinc-600 transition hover:text-[var(--brand-strong)]">
          <UserRound size={19} aria-hidden="true" />
          Tai khoan
        </Link>
        <Link href="/cart" className="grid min-h-12 place-items-center gap-0.5 text-[10px] font-medium text-zinc-600 transition hover:text-[var(--brand-strong)]">
          <ShoppingBag size={19} aria-hidden="true" />
          Gio hang
        </Link>
      </div>
    </nav>
  );
}
