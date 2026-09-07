import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { ProductPrice } from "@/components/product/ProductPrice";
import { prisma } from "@/lib/prisma";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/order/PaymentStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
        <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
          Quản trị
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
          Đơn hàng
        </h1>
        <p className="mt-2 text-zinc-600">
          Quản lý và theo dõi tất cả đơn hàng trong hệ thống.
        </p>
        </div>
        <p className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-700">
          {orders.length} đơn hàng
        </p>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {orders.length > 0 ? (
          <div>
            <div className="hidden border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-bold uppercase text-zinc-500 lg:grid lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
              <span>Đơn hàng</span>
              <span>Khách hàng</span>
              <span>Trạng thái</span>
              <span className="text-right">Tổng tiền</span>
            </div>
            <div className="divide-y divide-zinc-100">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid gap-4 px-5 py-4 transition hover:bg-amber-50/60 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:items-center"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {order.items.length} sản phẩm -{" "}
                    {order.createdAt.toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div className="text-sm text-zinc-600">
                  <p>{order.user.name ?? "Khách hàng"}</p>
                  <p>{order.user.email}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>

                <div className="lg:text-right">
                  <ProductPrice price={order.total} />
                </div>
              </Link>
            ))}
            </div>
          </div>
        ) : (
          <EmptyState
            className="m-5"
            title="Chưa có đơn hàng nào"
            description="Khi khách hàng đặt hàng, đơn hàng sẽ xuất hiện tại đây để admin theo dõi."
            icon={<ClipboardList size={22} aria-hidden="true" />}
          />
        )}
      </section>
    </main>
  );
}
