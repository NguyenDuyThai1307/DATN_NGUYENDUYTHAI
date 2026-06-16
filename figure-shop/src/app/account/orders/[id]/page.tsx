import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getOrderByIdForUser } from "@/services/order.service";
import { DemoPaymentButton } from "@/components/checkout/DemoPaymentButton";

type AccountOrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AccountOrderDetailPage({
  params,
}: AccountOrderDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/account/orders");
  }

  const { id } = await params;
  const order = await getOrderByIdForUser(id, user.id);

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/account/orders"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
      >
        ← Quay lai don hang
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Don hang {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Trang thai: {order.status} - Thanh toan: {order.paymentStatus}
          </p>
        </div>

        <ProductPrice price={order.total} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="rounded-md border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">San pham</h2>

          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {item.quantity} x{" "}
                    <ProductPrice price={item.productPrice} />
                  </p>
                </div>

                <ProductPrice price={item.total} />
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-md border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold">Thong tin giao hang</h2>

            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p>{order.receiverName}</p>
              <p>{order.receiverPhone}</p>
              <p>
                {order.addressDetail}, {order.ward}, {order.district},{" "}
                {order.province}
              </p>
              {order.note ? <p>Ghi chu: {order.note}</p> : null}
            </div>
          </section>

          <section className="rounded-md border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold">Thanh toan</h2>

            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p>Phuong thuc: {order.paymentMethod}</p>
              <p>Trang thai: {order.paymentStatus}</p>
              <div className="flex items-center justify-between border-t border-zinc-200 pt-3">
                <span>Tong cong</span>
                <ProductPrice price={order.total} />
             </div>
            </div>

            {order.paymentMethod === "DEMO" && order.paymentStatus !== "PAID" ? (
              <div className="mt-4">
                <DemoPaymentButton orderId={order.id} />
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </main>
  );
}