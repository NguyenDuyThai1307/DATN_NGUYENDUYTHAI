import Link from "next/link";
import { MapPin, Phone, ShieldCheck } from "lucide-react";

type TopBarProps = {
  isAuthenticated: boolean;
};

export function TopBar({ isAuthenticated }: TopBarProps) {
  return (
    <div className="hidden border-b border-black/5 bg-amber-50 text-xs text-zinc-700 md:block">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-2">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck size={13} aria-hidden="true" />
            Mô hình chính hãng, hỗ trợ đặt trước
          </span>
          <a href="tel:0900000000" className="inline-flex items-center gap-1.5 font-medium hover:text-[var(--brand-strong)]">
            <Phone size={13} aria-hidden="true" />
            Hotline: 0900 000 000
          </a>
          <Link href="/contact#stores" className="inline-flex items-center gap-1.5 font-medium hover:text-[var(--brand-strong)]">
            <MapPin size={13} aria-hidden="true" />
            Hệ thống cửa hàng
          </Link>
        </div>

        {isAuthenticated ? (
          <Link href="/account" className="font-medium hover:text-[var(--brand-strong)]">
            Tài khoản của tôi
          </Link>
        ) : (
          <div className="flex items-center gap-3 font-medium">
            <Link href="/login" className="hover:text-[var(--brand-strong)]">
              Đăng nhập
            </Link>
            <span className="text-zinc-300">/</span>
            <Link href="/register" className="hover:text-[var(--brand-strong)]">
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
