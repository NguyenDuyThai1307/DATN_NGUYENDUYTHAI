import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/permissions";
import { getAdminUser } from "@/services/admin-user.service";
import { StorefrontError } from "@/lib/storefront-error";
import { UserAccessEditor } from "@/components/admin/UserAccessEditor";
export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  const user = await getAdminUser((await params).id).catch(error => { if (error instanceof StorefrontError && error.status === 404) notFound(); throw error; });
  return <main>
    <Link href="/admin/users" className="text-sm underline">← Danh sách người dùng</Link>
    <h1 className="mt-4 text-3xl font-bold">{user.name || "Chi tiết người dùng"}</h1>
    <dl className="mt-5 grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-2">{[["Email", user.email], ["Điện thoại", user.phone || "Chưa cập nhật"], ["Vai trò", user.role], ["Trạng thái", user.isActive ? "Hoạt động" : "Bị khóa"], ["Ngày tạo", user.createdAt.toLocaleDateString("vi-VN")], ["Hoạt động", `${user._count.orders} đơn · ${user._count.reviews} đánh giá · ${user._count.wishlist} yêu thích`]].map(([label, value]) => <div key={label}><dt className="text-sm text-zinc-500">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>)}</dl>
    <UserAccessEditor key={user.sessionVersion} user={{ id: user.id, role: user.role, isActive: user.isActive, sessionVersion: user.sessionVersion }} self={actor.id === user.id} />
    <section className="mt-6 rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">10 đơn hàng gần nhất</h2><div className="mt-3 divide-y">{user.orders.map(order => <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex flex-wrap justify-between gap-3 py-3 text-sm"><span className="font-semibold">{order.orderNumber}</span><span>{order.status} · {order.paymentStatus}</span><span>{order.total.toLocaleString("vi-VN")} đ</span></Link>)}{!user.orders.length && <p className="text-sm text-zinc-500">Chưa có đơn hàng.</p>}</div></section>
  </main>;
}
