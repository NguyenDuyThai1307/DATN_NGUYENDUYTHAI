"use client";
import Link from "next/link";
import { useState } from "react";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/order/PaymentStatusBadge";
import type { getOrdersByUserId } from "@/services/order.service";
type Orders = Awaited<ReturnType<typeof getOrdersByUserId>>;
const tabs = [{ value: "all", label: "Tất cả" }, { value: "processing", label: "Đang xử lý" }, { value: "completed", label: "Hoàn thành" }, { value: "cancelled", label: "Đã hủy" }];
function matches(order: Orders[number], filter: string) { return filter === "all" || (filter === "completed" ? order.status === "COMPLETED" : filter === "cancelled" ? order.status === "CANCELLED" : !["COMPLETED", "CANCELLED"].includes(order.status)); }
export function OrderHistory({ orders }: { orders: Orders }) {
  const [filter, setFilter] = useState("all");
  const selected = orders.filter(order => matches(order, filter));
  return <div>
    <nav aria-label="Lọc trạng thái đơn hàng" className="my-5 flex gap-2 overflow-auto pb-1">{tabs.map(tab => <button key={tab.value} onClick={() => setFilter(tab.value)} aria-pressed={filter === tab.value} className={`shrink-0 rounded-md border px-4 py-2.5 text-sm ${filter === tab.value ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200 bg-white"}`}>{tab.label} ({orders.filter(order => matches(order, tab.value)).length})</button>)}</nav>
    <div className="mb-2 hidden grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-xs font-semibold md:grid">{["Mã đơn hàng", "Ngày đặt", "Tổng tiền", "Thanh toán", "Trạng thái"].map(label => <span key={label}>{label}</span>)}</div>
    <div className="space-y-3">{selected.map(order => <details key={order.id} className="group overflow-hidden rounded-lg border border-zinc-200 bg-white open:bg-blue-50/40">
      <summary className="grid cursor-pointer grid-cols-2 items-center gap-3 p-4 text-sm md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]"><span className="break-all font-bold text-blue-600">{order.orderNumber}</span><span className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span><span className="font-bold text-[var(--brand)]">{order.total.toLocaleString("vi-VN")} đ<span className="block text-xs font-normal text-zinc-500">{order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span></span><PaymentStatusBadge status={order.paymentStatus} /><OrderStatusBadge status={order.status} /></summary>
      <div className="border-t border-zinc-200 p-4"><div className="mb-4 flex flex-wrap justify-between gap-3"><h2 className="text-sm font-bold">Chi tiết sản phẩm</h2><Link href={`/account/orders/${order.id}`} className="text-xs font-semibold text-blue-600">Xem chi tiết đơn hàng →</Link></div><div className="grid gap-5 lg:grid-cols-2"><div className="space-y-2">{order.items.map(item => <div key={item.id} className="flex justify-between gap-4 rounded-md border border-zinc-200 bg-white p-3 text-xs"><div><p className="font-semibold">{item.productName}</p><p className="mt-1 text-zinc-500">Số lượng: {item.quantity}</p></div><span className="shrink-0 font-bold text-[var(--brand)]">{item.total.toLocaleString("vi-VN")} đ</span></div>)}</div><div className="rounded-md border border-zinc-200 bg-white p-4 text-xs leading-6"><h3 className="font-bold">Thông tin nhận hàng</h3><p>{order.receiverName} · {order.receiverPhone}</p><p>{[order.addressDetail, order.ward, order.district, order.province].join(", ")}</p><p className="mt-2">Thanh toán: {order.paymentMethod}</p><Link href="/contact" className="mt-4 block rounded-md border border-blue-600 py-2 text-center font-bold text-blue-600">Liên hệ hỗ trợ</Link></div></div></div>
    </details>)}{!selected.length && <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">Chưa có đơn hàng ở trạng thái này.<Link href="/products" className="mt-4 block text-blue-600 underline">Khám phá sản phẩm</Link></div>}</div>
  </div>;
}
