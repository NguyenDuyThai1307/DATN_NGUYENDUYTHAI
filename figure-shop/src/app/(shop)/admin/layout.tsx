import Link from "next/link";
import { Bell, ChevronDown, Search, UserRound } from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { requireStaff } from "@/lib/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return <div className="admin-shell">
    <header className="admin-topbar">
      <Link href="/admin" className="admin-wordmark"><strong>Figure <span>Shop</span></strong><span>{user.role === "ADMIN" ? "Admin" : "Staff"}</span></Link>
      <div className="admin-topbar-actions">
        <form action="/admin/products" className="admin-topbar-search"><button aria-label="Tìm kiếm sản phẩm"><Search size={15} /></button><input name="query" aria-label="Tìm sản phẩm trong admin" placeholder="Tìm kiếm…" /></form>
        <Link href="/admin#inventory-alerts" className="admin-notifications" aria-label="Xem cảnh báo tồn kho" title="Cảnh báo tồn kho"><Bell size={20} /></Link>
        <details className="admin-account-menu"><summary><span className="admin-avatar"><UserRound size={18} /></span><span className="admin-account-name">{user.name || (user.role === "ADMIN" ? "Admin" : "Nhân viên")}</span><ChevronDown size={13} /></summary><div><Link href="/account">Tài khoản của tôi</Link><Link href="/">Về cửa hàng</Link><LogoutButton /></div></details>
      </div>
    </header>
    <div className="admin-workspace"><AdminSidebar role={user.role === "ADMIN" ? "ADMIN" : "STAFF"} /><div className="admin-main-content">{children}</div></div>
  </div>;
}
