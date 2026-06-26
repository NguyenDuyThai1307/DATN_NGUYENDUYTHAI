import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

type TopBarProps = {
  isAuthenticated: boolean;
};

export function TopBar({ isAuthenticated }: TopBarProps) {
  return (
    <div className="hidden border-b border-rose-100 bg-rose-50 text-xs text-zinc-600 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
        <div className="flex items-center gap-5">
          <a href="tel:0900000000" className="inline-flex items-center gap-1.5 hover:text-[var(--brand-strong)]">
            <Phone size={13} aria-hidden="true" />
            Hotline: 0900 000 000
          </a>
          <Link href="/contact#stores" className="inline-flex items-center gap-1.5 hover:text-[var(--brand-strong)]">
            <MapPin size={13} aria-hidden="true" />
            He thong cua hang
          </Link>
        </div>

        {isAuthenticated ? (
          <Link href="/account" className="font-medium hover:text-[var(--brand-strong)]">
            Tai khoan cua toi
          </Link>
        ) : (
          <div className="flex items-center gap-3 font-medium">
            <Link href="/login" className="hover:text-[var(--brand-strong)]">
              Dang nhap
            </Link>
            <span className="text-zinc-300">/</span>
            <Link href="/register" className="hover:text-[var(--brand-strong)]">
              Dang ky
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
