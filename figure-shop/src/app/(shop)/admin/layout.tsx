import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { requireStaff } from "@/lib/permissions";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return <div className="admin-shell lg:flex"><AdminSidebar role={user.role === "ADMIN" ? "ADMIN" : "STAFF"} /><div className="min-w-0 flex-1">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-3 lg:px-8">
      <form action="/admin/products" className="flex w-full max-w-lg"><input name="query" aria-label="Tìm sản phẩm trong admin" placeholder="Tìm kiếm sản phẩm trong hệ thống…" className="min-w-0 flex-1 rounded-l-md border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm" /><button aria-label="Tìm sản phẩm" className="rounded-r-md bg-blue-600 px-4 text-white"><Search size={19} /></button></form>
      <Link href="/account" className="flex items-center gap-3 text-sm"><span className="grid size-10 place-items-center rounded-full bg-blue-50 text-blue-600"><UserRound size={22} /></span><span><strong className="block">{user.name || user.email}</strong><span className="text-xs text-zinc-500">{user.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}</span></span></Link>
    </header><div className="px-4 py-6 sm:px-6 lg:px-7">{children}</div>
  </div></div>;
}
