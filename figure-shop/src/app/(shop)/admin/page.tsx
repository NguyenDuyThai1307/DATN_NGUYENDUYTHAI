import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import {
  getAdminDashboardStats,
  getRecentOrdersForAdmin,
} from "@/services/admin.service";
import { ProductPrice } from "@/components/product/ProductPrice";

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getAdminDashboardStats(),
    getRecentOrdersForAdmin(),
  ]);

  return (
    <main>
      <div className="rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-800 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-amber-300">
            Trung tâm quản trị
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Tổng quan
          </h1>
          <p className="mt-2 text-zinc-300">
            Tổng quan sản phẩm, đơn hàng và doanh thu.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-100"
        >
          Quản lý sản phẩm
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        </div>
      </div>

      <div className="mt-8">
        <DashboardStats stats={stats} />
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
              Theo dõi nhanh
            </p>
            <h2 className="mt-1 font-bold text-zinc-950">Đơn hàng mới</h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-zinc-600 hover:text-[var(--brand-strong)]"
          >
            Xem tất cả
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-amber-50/60"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {order.user.name ?? order.user.email} - {order.status}
                  </p>
                </div>

                <ProductPrice price={order.total} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-zinc-600">
            Chưa có đơn hàng nào.
          </div>
        )}
      </section>
    </main>
  );
}
