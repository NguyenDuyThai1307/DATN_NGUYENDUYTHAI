import Link from "next/link";
import { ProductPrice } from "@/components/product/ProductPrice";
import { prisma } from "@/lib/prisma";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/order/PaymentStatusBadge";

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Don hang</h1>
        <p className="mt-2 text-zinc-600">
          Quan ly va theo doi tat ca don hang trong he thong.
        </p>
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-zinc-200 bg-white">
        {orders.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid gap-4 px-5 py-4 transition hover:bg-zinc-50 lg:grid-cols-[1.2fr_1fr_1fr_1fr]"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {order.items.length} san pham
                  </p>
                </div>

                <div className="text-sm text-zinc-600">
                  <p>{order.user.name ?? "Khach hang"}</p>
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
        ) : (
          <div className="px-5 py-8 text-center text-zinc-600">
            Chua co don hang nao.
          </div>
        )}
      </section>
    </main>
  );
}