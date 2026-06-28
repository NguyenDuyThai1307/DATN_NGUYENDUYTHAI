import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getOrdersByUserId } from "@/services/order.service";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/order/PaymentStatusBadge";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/account/orders");
  }

  const orders = await getOrdersByUserId(user.id);
  const unpaidOrders = orders.filter(
    (order) => order.paymentStatus === "UNPAID",
  ).length;
  const paidTotal = orders
    .filter((order) => order.paymentStatus === "PAID")
    .reduce((total, order) => total + order.total, 0);

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Trang chu", href: "/" },
          { label: "Tai khoan", href: "/account" },
          { label: "Don hang" },
        ]}
      />

      <div className="mt-6">
        <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
          Lich su mua hang
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
          Don hang cua toi
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Theo doi trang thai xu ly, thanh toan va xem lai chi tiet tung don
          hang da dat.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <OrderMetricCard label="Tong don hang" value={`${orders.length}`} />
        <OrderMetricCard label="Chua thanh toan" value={`${unpaidOrders}`} />
        <OrderMetricCard
          label="Da thanh toan"
          value={<ProductPrice price={paidTotal} />}
        />
      </div>

      {orders.length > 0 ? (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Ma don hang</p>
                  <p className="mt-1 font-bold text-zinc-950">
                    {order.orderNumber}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    So san pham: {order.items.length}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="mb-1 text-sm text-zinc-500">Tong tien</p>
                  <ProductPrice price={order.total} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          title="Ban chua co don hang nao"
          description="Khi dat hang thanh cong, don hang se xuat hien tai day de ban tien theo doi."
          icon={<ClipboardList size={22} aria-hidden="true" />}
          action={{ href: "/products", label: "Xem san pham" }}
        />
      )}
    </main>
  );
}

function OrderMetricCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase text-zinc-500">{label}</p>
      <div className="mt-2 text-xl font-black text-zinc-950">{value}</div>
    </div>
  );
}
