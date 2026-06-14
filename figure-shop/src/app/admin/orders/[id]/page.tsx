import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPrice } from "@/components/product/ProductPrice";
import { prisma } from "@/lib/prisma";

type AdminOrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      items: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main>
      <Link
        href="/admin/orders"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
      >
        ← Quay lai don hang
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Khach hang: {order.user.name ?? order.user.email}
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
            <h2 className="font-semibold">Trang thai</h2>

            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p>Don hang: {order.status}</p>
              <p>Thanh toan: {order.paymentStatus}</p>
              <p>Phuong thuc: {order.paymentMethod}</p>
            </div>
          </section>

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
        </aside>
      </div>
    </main>
  );
}