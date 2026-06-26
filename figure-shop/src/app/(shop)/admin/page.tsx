import Link from "next/link";
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-zinc-600">
            Tong quan san pham, don hang va doanh thu.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Quan ly san pham
        </Link>
      </div>

      <div className="mt-8">
        <DashboardStats stats={stats} />
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold">Don hang moi</h2>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-zinc-50"
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
            Chua co don hang nao.
          </div>
        )}
      </section>
    </main>
  );
}