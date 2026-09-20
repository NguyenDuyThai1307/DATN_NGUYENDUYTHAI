import Link from "next/link";
import { requireAdmin } from "@/lib/permissions";
import { listAdminUsers } from "@/services/admin-user.service";
import { adminUserQuerySchema } from "@/validations/admin-user.schema";
export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const parsed = adminUserQuerySchema.safeParse(await searchParams);
  const data = await listAdminUsers(parsed.success ? parsed.data : {});
  const link = (page: number) => `/admin/users?${new URLSearchParams({ ...data.filters, page: String(page) })}`;
  return <main>
    <h1 className="text-3xl font-bold">Quản lý người dùng</h1><p className="mt-2 text-sm text-zinc-500">{data.total} tài khoản phù hợp · Chỉ quản trị viên có quyền truy cập.</p>
    {!parsed.success && <p role="alert" className="mt-3 text-sm text-red-600">Bộ lọc không hợp lệ. Đang hiển thị danh sách mặc định.</p>}
    <form className="my-6 flex flex-wrap gap-3 rounded-xl border bg-white p-4">
      <input name="q" aria-label="Tìm người dùng" maxLength={100} defaultValue={data.filters.q} placeholder="Tên, email hoặc số điện thoại" className="min-w-56 flex-1 rounded-lg border px-3 py-2" />
      <select name="role" aria-label="Lọc vai trò" defaultValue={data.filters.role} className="rounded-lg border p-2"><option value="">Tất cả vai trò</option>{["CUSTOMER", "STAFF", "ADMIN"].map(role => <option key={role}>{role}</option>)}</select>
      <select name="status" aria-label="Lọc trạng thái" defaultValue={data.filters.status} className="rounded-lg border p-2"><option value="">Tất cả trạng thái</option><option value="active">Hoạt động</option><option value="locked">Bị khóa</option></select>
      <button className="rounded-lg bg-zinc-900 px-4 py-2 text-white">Tìm kiếm</button><Link href="/admin/users" className="px-3 py-2 text-sm underline">Xóa bộ lọc</Link>
    </form>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><caption className="sr-only">Danh sách người dùng</caption><thead className="bg-zinc-100"><tr>{["Người dùng", "Vai trò", "Trạng thái", "Đơn hàng", "Ngày tạo", "Thao tác"].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>
      {data.users.map(user => <tr key={user.id} className="border-t"><td className="p-4"><p className="font-semibold">{user.name || "Chưa đặt tên"}</p><p className="text-zinc-500">{user.email}</p><p className="text-zinc-500">{user.phone}</p></td><td className="p-4">{user.role}</td><td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${user.isActive ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{user.isActive ? "Hoạt động" : "Bị khóa"}</span></td><td className="p-4">{user._count.orders}</td><td className="p-4">{user.createdAt.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td><td className="p-4"><Link href={`/admin/users/${user.id}`} className="font-semibold text-[var(--brand-strong)] underline">Chi tiết</Link></td></tr>)}
      {!data.users.length && <tr><td colSpan={6} className="p-8 text-center text-zinc-500">Không có người dùng phù hợp.</td></tr>}
    </tbody></table></div>
    <nav aria-label="Phân trang người dùng" className="mt-5 flex items-center justify-center gap-5">{data.page > 1 && <Link href={link(data.page - 1)}>Trang trước</Link>}<span className="text-sm">Trang {data.page}/{data.pages}</span>{data.page < data.pages && <Link href={link(data.page + 1)}>Trang sau</Link>}</nav>
  </main>;
}
