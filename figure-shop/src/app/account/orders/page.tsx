import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getOrdersByUserId } from "@/services/order.service";

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/account/orders");
  }

  const orders = await getOrdersByUserId(user.id);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Don hang cua toi</h1>

      {orders.length > 0 ? (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-md border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Trang thai: {order.status} - Thanh toan:{" "}
                    {order.paymentStatus}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    So san pham: {order.items.length}
                  </p>
                </div>

                <ProductPrice price={order.total} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-md border border-zinc-200 bg-white p-8 text-center">
          <p className="text-zinc-600">Ban chua co don hang nao.</p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Xem san pham
          </Link>
        </div>
      )}
    </main>
  );
}