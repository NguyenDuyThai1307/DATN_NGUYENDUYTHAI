import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByIdForUser } from "@/services/order.service";
import { OnlinePaymentPanel } from "@/components/checkout/OnlinePaymentPanel";
export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const { orderId } = await searchParams;
  if (!orderId) redirect("/account/orders");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/checkout/payment-result?orderId=${orderId}`)}`);
  const order = await getOrderByIdForUser(orderId, user.id);
  if (!order) notFound();
  return <main className="mx-auto max-w-3xl px-5 py-12">
    <h1 className="text-2xl font-bold">Thanh toán đơn {order.orderNumber}</h1>
    <p className="mt-3">Tổng tiền: {order.total.toLocaleString("vi-VN")} đ</p>
    <OnlinePaymentPanel orderId={order.id} />
    <Link className="underline" href={`/account/orders/${order.id}`}>Xem chi tiết đơn hàng</Link>
  </main>;
}
