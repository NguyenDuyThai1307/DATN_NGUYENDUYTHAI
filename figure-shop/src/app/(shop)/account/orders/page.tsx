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
          { label: "Trang chủ", href: "/" },
          { label: "Tài khoản", href: "/account" },
          { label: "Đơn hàng" },
        ]}
      />

      <div className="mt-6">
        <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
          Lịch sử mua hàng
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
          Đơn hàng của toi
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Theo dõi trạng thái xử lý, thanh toán và xem lại chi tiết từng đơn
          hàng đã đặt.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <OrderMetricCard label="Tổng đơn hàng" value={`${orders.length}`} />
        <OrderMetricCard label="Chưa thanh toán" value={`${unpaidOrders}`} />
        <OrderMetricCard
          label="Đã thanh toán"
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
                  <p className="text-sm text-zinc-500">Mã đơn hàng</p>
                  <p className="mt-1 font-bold text-zinc-950">
                    {order.orderNumber}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    Số sản phẩm: {order.items.length}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="mb-1 text-sm text-zinc-500">Tổng tiền</p>
                  <ProductPrice price={order.total} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          title="Bạn chưa có đơn hàng nào"
          description="Khi đặt hàng thành công, đơn hàng sẽ xuất hiện tại đây để bạn tiện theo dõi."
          icon={<ClipboardList size={22} aria-hidden="true" />}
          action={{ href: "/products", label: "Xem sản phẩm" }}
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
