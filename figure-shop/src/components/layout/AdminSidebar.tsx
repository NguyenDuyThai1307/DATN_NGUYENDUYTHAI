"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Box, Layers, Tag, Users, Ticket, ChartNoAxesCombined, Clock, Store } from "lucide-react";
const items = [
  { href: "/admin", label: "Tổng quan", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", Icon: Box },
  { href: "/admin/categories", label: "Danh mục", Icon: Layers },
  { href: "/admin/orders", label: "Đơn hàng", Icon: ShoppingBag },
  { href: "/admin/brands", label: "Thương hiệu", Icon: Tag },
  { href: "/admin/users", label: "Người dùng", Icon: Users },
  { href: "/admin/preorders", label: "Đặt trước", Icon: Clock },
  { href: "/admin/promotions", label: "Khuyến mãi", Icon: Ticket },
  { href: "/admin/coupons", label: "Coupon", Icon: Ticket },
  { href: "/admin/reports", label: "Báo cáo", Icon: ChartNoAxesCombined },
];
export function AdminSidebar({ role }: { role: "STAFF" | "ADMIN" }) {
  const path = usePathname();
  return <aside className="admin-sidebar">
    <nav aria-label="Quản trị">{items.filter(item => item.href !== "/admin/users" || role === "ADMIN").map(({ href, label, Icon }) => {
      const active = href === "/admin" ? path === href : path.startsWith(href);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon size={17} strokeWidth={1.7} />{label}</Link>;
    })}</nav><Link href="/" className="admin-back-to-shop"><Store size={17} />Quay về trang chủ</Link>
  </aside>;
}
