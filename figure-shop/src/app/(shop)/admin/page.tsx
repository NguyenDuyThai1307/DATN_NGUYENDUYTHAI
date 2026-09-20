import { RevenueOverview } from "@/components/admin/RevenueOverview";
import { getAdminRevenueReport } from "@/services/admin-revenue.service";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import {
  getAdminDashboardStats,
  getRecentOrdersForAdmin,
} from "@/services/admin.service";
import { ProductPrice } from "@/components/product/ProductPrice";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period } = await searchParams;
  const days = period === "7" ? 7 : period === "90" ? 90 : 30;
  const [stats, recentOrders, revenue] = await Promise.all([
    getAdminDashboardStats(),
    getRecentOrdersForAdmin(),
    getAdminRevenueReport(days),
  ]);

  return (
    <main>
      <div className="mb-6 rounded-lg py-2 text-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-blue-600">
            Trung tâm quản trị
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Xin chào, quản trị viên!
          </h1>
          <p className="mt-2 text-zinc-500">
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

      <DashboardStats stats={stats} />
      <RevenueOverview report={revenue} />
      {stats.needsReviewCount > 0 && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Có {stats.needsReviewCount} giao dịch cần đối soát trong hệ thống. Các giao dịch này không được tính vào báo cáo.</p>}


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
                    {order.user.name ?? order.user.email}
                  </p>
                </div>

                <div className="flex items-center gap-3"><OrderStatusBadge status={order.status} /><ProductPrice price={order.total} /></div>
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
