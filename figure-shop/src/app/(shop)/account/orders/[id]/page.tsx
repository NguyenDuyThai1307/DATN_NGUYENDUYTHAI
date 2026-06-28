import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DemoPaymentButton } from "@/components/checkout/DemoPaymentButton";
import { PaymentStatusBadge } from "@/components/order/PaymentStatusBadge";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { OrderProgress } from "@/components/order/OrderProgress";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByIdForUser } from "@/services/order.service";

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

  const productDiscountAmount =
    order.discountAmount - order.couponDiscountAmount;

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Trang chu", href: "/" },
          { label: "Tai khoan", href: "/account" },
          { label: "Don hang", href: "/account/orders" },
          { label: order.orderNumber },
        ]}
      />

      <Link
        href="/account/orders"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-[var(--brand-strong)]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Quay lai don hang
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
            Chi tiet don hang
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
            Don hang {order.orderNumber}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-zinc-500">
            Tong thanh toan
          </p>
          <div className="mt-1">
            <ProductPrice price={order.total} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <OrderProgress status={order.status} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">San pham</h2>

          <div className="mt-4 space-y-4">
            {order.items.map((item) => {
              const originalPrice = item.originalPrice || item.productPrice;
              const finalPrice = item.finalPrice || item.productPrice;

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.productName}</p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {item.quantity} x{" "}
                      <ProductPrice
                        price={finalPrice}
                        originalPrice={
                          originalPrice > finalPrice ? originalPrice : undefined
                        }
                      />
                    </p>

                    {item.discountAmount > 0 ? (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        Giam {item.discountAmount.toLocaleString("vi-VN")} d
                      </p>
                    ) : null}
                  </div>

                  <ProductPrice price={item.total} />
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-36 lg:h-fit">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">
              Thong tin giao hang
            </h2>

            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p className="font-semibold text-zinc-950">
                {order.receiverName}
              </p>
              <p>{order.receiverPhone}</p>
              <p>
                {order.addressDetail}, {order.ward}, {order.district},{" "}
                {order.province}
              </p>
              {order.note ? <p>Ghi chu: {order.note}</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">Thanh toan</h2>

            <div className="mt-4 space-y-3 text-sm text-zinc-600">
              <p>Phuong thuc: {order.paymentMethod}</p>
              <div className="flex flex-wrap gap-2">
                <span>Trang thai:</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>

              <div className="space-y-3 border-t border-zinc-200 pt-3">
                <div className="flex items-center justify-between">
                  <span>Tam tinh</span>
                  <ProductPrice price={order.subtotal} />
                </div>

                {productDiscountAmount > 0 ? (
                  <div className="flex items-center justify-between gap-4">
                    <span>Giam san pham</span>
                    <span className="font-medium text-red-600">
                      -{productDiscountAmount.toLocaleString("vi-VN")} d
                    </span>
                  </div>
                ) : null}

                {order.couponDiscountAmount > 0 ? (
                  <div className="flex items-center justify-between gap-4">
                    <span>
                      Giam coupon{" "}
                      {order.couponCode ? `(${order.couponCode})` : ""}
                    </span>
                    <span className="font-medium text-red-600">
                      -{order.couponDiscountAmount.toLocaleString("vi-VN")} d
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between">
                  <span>Phi giao hang</span>
                  {order.shippingFee === 0 ? (
                    <span className="font-medium text-emerald-700">
                      Mien phi
                    </span>
                  ) : (
                    <ProductPrice price={order.shippingFee} />
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 pt-3 font-medium">
                  <span>Tong cong</span>
                  <ProductPrice price={order.total} />
                </div>
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
