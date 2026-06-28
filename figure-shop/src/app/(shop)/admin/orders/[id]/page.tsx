import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderProgress } from "@/components/order/OrderProgress";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/order/PaymentStatusBadge";
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

  const productDiscountAmount =
    order.discountAmount - order.couponDiscountAmount;

  return (
    <main>
      <Link
        href="/admin/orders"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
      >
        {"<-"} Quay lai don hang
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
            Chi tiet don hang
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Khach hang: {order.user.name ?? order.user.email}
          </p>
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-zinc-950">San pham</h2>

          <div className="mt-4 space-y-4">
            {order.items.map((item) => {
              const originalPrice = item.originalPrice || item.productPrice;
              const finalPrice = item.finalPrice || item.productPrice;

              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 last:border-0 last:pb-0"
                >
                  <div>
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
            <h2 className="font-bold text-zinc-950">Trang thai</h2>

            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <span>Don hang:</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-2">
                <span>Thanh toan:</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <p>Phuong thuc: {order.paymentMethod}</p>

              {order.payment?.transactionCode ? (
                <p>Ma giao dich: {order.payment.transactionCode}</p>
              ) : null}

              {order.payment?.paidAt ? (
                <p>
                  Da thanh toan luc:{" "}
                  {order.payment.paidAt.toLocaleString("vi-VN")}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-zinc-950">Tom tat thanh toan</h2>

            <div className="mt-4 space-y-3 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Tam tinh</span>
                <ProductPrice price={order.subtotal} />
              </div>

              {productDiscountAmount > 0 ? (
                <div className="flex items-center justify-between">
                  <span>Giam san pham</span>
                  <span className="font-medium text-red-600">
                    -{productDiscountAmount.toLocaleString("vi-VN")} d
                  </span>
                </div>
              ) : null}

              {order.couponDiscountAmount > 0 ? (
                <div className="flex items-center justify-between">
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

              <div className="flex items-center justify-between border-t border-zinc-200 pt-3 font-medium text-zinc-950">
                <span>Tong cong</span>
                <ProductPrice price={order.total} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-zinc-950">Thong tin giao hang</h2>

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
        </aside>
      </div>
    </main>
  );
}
