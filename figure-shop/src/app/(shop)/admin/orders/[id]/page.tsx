import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderProgress } from "@/components/order/OrderProgress";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/order/PaymentStatusBadge";
import { ProductPrice } from "@/components/product/ProductPrice";
import { prisma } from "@/lib/prisma";
import { OnlinePaymentPanel } from "@/components/checkout/OnlinePaymentPanel";
import { isOnlinePayment } from "@/lib/payment-config";

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
      payment: { include: { attempts: { orderBy: { createdAt: "desc" }, include: { events: { orderBy: { receivedAt: "desc" }, take: 20 } } } } },
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
        {"<-"} Quay lại đơn hàng
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
            Chi tiết đơn hàng
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Khách hàng: {order.user.name ?? order.user.email}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-zinc-500">
            Tổng thanh toán
          </p>
          <div className="mt-1">
            <ProductPrice price={order.total} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <OrderProgress status={order.status} />
      </div>
      {isOnlinePayment(order.paymentMethod) && <OnlinePaymentPanel orderId={order.id} allowPay={false} />}
      {order.payment && <section className="mt-5 overflow-x-auto rounded-xl border p-5">
        <h2 className="font-bold">Lịch sử thanh toán — {order.payment.environment}{order.isTestOrder ? " / Đơn thử nghiệm" : ""}</h2>
        {order.payment.needsReview && <p className="mt-2 text-amber-800">Cần đối soát: {order.payment.reviewReason}</p>}
        <table className="mt-3 w-full text-left text-sm"><thead><tr><th>Cổng / tham chiếu</th><th>Trạng thái</th><th>Số tiền</th><th>Giao dịch nhận được</th></tr></thead>
          <tbody>{order.payment.attempts.map((attempt) => <tr key={attempt.id} className="border-t"><td className="py-3">{attempt.provider}<br />{attempt.providerReference}</td><td>{attempt.status}</td><td>{attempt.amount.toLocaleString("vi-VN")} đ</td><td>{attempt.events.map((event) => <p key={event.id}>{event.providerTransactionId ?? "Đối soát"}: {event.result} — {event.amount.toLocaleString("vi-VN")} đ</p>)}</td></tr>)}</tbody>
        </table>
      </section>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-zinc-950">Sản phẩm</h2>

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
                        Giảm {item.discountAmount.toLocaleString("vi-VN")} đ
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
            <h2 className="font-bold text-zinc-950">Trạng thái</h2>

            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <span>Đơn hàng:</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center gap-2">
                <span>Thanh toán:</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <p>Phương thức: {order.paymentMethod}</p>

              {order.payment?.transactionCode ? (
                <p>Mã giao dịch: {order.payment.transactionCode}</p>
              ) : null}

              {order.payment?.paidAt ? (
                <p>
                  Đã thanh toán lúc:{" "}
                  {order.payment.paidAt.toLocaleString("vi-VN")}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-zinc-950">Tóm tắt thanh toán</h2>

            <div className="mt-4 space-y-3 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Tạm tính</span>
                <ProductPrice price={order.subtotal} />
              </div>

              {productDiscountAmount > 0 ? (
                <div className="flex items-center justify-between">
                  <span>Giảm sản phẩm</span>
                  <span className="font-medium text-red-600">
                    -{productDiscountAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              ) : null}

              {order.couponDiscountAmount > 0 ? (
                <div className="flex items-center justify-between">
                  <span>
                    Giảm coupon{" "}
                    {order.couponCode ? `(${order.couponCode})` : ""}
                  </span>
                  <span className="font-medium text-red-600">
                    -{order.couponDiscountAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <span>Phí giao hàng</span>
                {order.shippingFee === 0 ? (
                  <span className="font-medium text-emerald-700">
                    Miễn phí
                  </span>
                ) : (
                  <ProductPrice price={order.shippingFee} />
                )}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-200 pt-3 font-medium text-zinc-950">
                <span>Tổng cộng</span>
                <ProductPrice price={order.total} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-zinc-950">Thông tin giao hàng</h2>

            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p className="font-semibold text-zinc-950">
                {order.receiverName}
              </p>
              <p>{order.receiverPhone}</p>
              <p>
                {order.addressDetail}, {order.ward}, {order.district},{" "}
                {order.province}
              </p>
              {order.note ? <p>Ghi chú: {order.note}</p> : null}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
