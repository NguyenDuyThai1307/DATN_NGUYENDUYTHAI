"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Box, Layers, Tag, Users, Ticket, ChartNoAxesCombined, Clock, Store } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
const items = [
  { href: "/admin", label: "Tổng quan", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Đơn hàng", Icon: ShoppingBag },
  { href: "/admin/products", label: "Sản phẩm", Icon: Box },
  { href: "/admin/categories", label: "Danh mục", Icon: Layers },
  { href: "/admin/brands", label: "Thương hiệu", Icon: Tag },
  { href: "/admin/users", label: "Người dùng", Icon: Users },
  { href: "/admin/preorders", label: "Đặt trước", Icon: Clock },
  { href: "/admin/promotions", label: "Khuyến mãi", Icon: Ticket },
  { href: "/admin/coupons", label: "Coupon", Icon: Ticket },
  { href: "/admin/reports", label: "Báo cáo", Icon: ChartNoAxesCombined },
];
export function AdminSidebar({ role }: { role: "STAFF" | "ADMIN" }) {
  const path = usePathname();
  return <aside className="shrink-0 border-b border-zinc-200 bg-white lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:border-r lg:border-b-0">
    <Link href="/admin" className="block px-5 py-5"><BrandLogo /></Link>
    <p className="hidden px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 lg:block">Quản lý cửa hàng</p>
    <nav aria-label="Quản trị" className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:px-3">{items.filter(item => item.href !== "/admin/users" || role === "ADMIN").map(({ href, label, Icon }) => {
      const active = href === "/admin" ? path === href : path.startsWith(href);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-3 rounded-md border-l-[3px] px-4 py-3 text-sm transition ${active ? "border-blue-600 bg-blue-50 font-semibold text-blue-600" : "border-transparent hover:bg-zinc-50"}`}><Icon size={19} />{label}</Link>;
    })}</nav><Link href="/" className="mx-6 mt-8 hidden items-center gap-3 border-t border-zinc-200 py-5 text-sm text-zinc-500 lg:flex"><Store size={18} />Về cửa hàng</Link>
  </aside>;
}
