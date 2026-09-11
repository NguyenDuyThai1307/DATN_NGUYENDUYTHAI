"use client";
import { useCallback, useEffect, useState } from "react";
import type { paymentStatus } from "@/services/online-payment.service";
type Status = Awaited<ReturnType<typeof paymentStatus>>;

export function OnlinePaymentPanel({ orderId, allowPay = true }: { orderId: string; allowPay?: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const response = await fetch(`/api/payment/orders/${orderId}`, { cache: "no-store" });
    if (response.status === 401) { window.location.assign(`/login?redirect=${encodeURIComponent(`/checkout/payment-result?orderId=${orderId}`)}`); return; }
    if (!response.ok) throw new Error("Không thể đọc trạng thái đơn");
    const data = await response.json() as Status;
    setStatus(data);
    return data;
  }, [orderId]);
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const start = Date.now();
    async function poll() {
      try {
        const data = await load();
        if (!stopped && data?.paymentStatus === "UNPAID" && data.orderStatus !== "CANCELLED" && Date.now() - start < 60_000) timer = setTimeout(poll, 3000);
      } catch { if (!stopped) setMessage("Chưa tải được kết quả. Vui lòng kiểm tra lại."); }
    }
    void poll();
    return () => { stopped = true; clearTimeout(timer); };
  }, [load]);
  async function act(action: "pay" | "refresh" | "cancel") {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(action === "pay" ? "/api/payment/requests" : `/api/payment/orders/${orderId}/${action}`, {
        method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ orderId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Không thể xử lý yêu cầu");
      if (data.checkoutUrl) { window.location.assign(data.checkoutUrl); return; }
      await load();
      if (response.status === 202) setMessage(action === "cancel" ? "Đang đối soát trước khi hủy. Đơn chỉ hủy khi xác định chưa nhận tiền và yêu cầu thanh toán đã đóng." : "Đang chờ xác nhận từ cổng. Bạn có thể kiểm tra lại sau.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Không thể kết nối"); }
    finally { setBusy(false); }
  }
  const text = !status ? "Đang tải trạng thái..." : status.needsReview ? "Thanh toán cần đối soát. Vui lòng liên hệ cửa hàng, không chuyển thêm tiền." : status.paymentStatus === "PAID" ? "Đã thanh toán thành công" : status.orderStatus === "CANCELLED" ? "Đơn hàng đã hủy" : "Chưa xác nhận thanh toán";
  return <section className="my-5 rounded-xl border border-zinc-200 bg-white p-5" aria-live="polite">
    <h2 className="text-lg font-bold">{text}</h2>
    {status?.environment === "SANDBOX" && <p className="mt-2 text-amber-800">Giao dịch VNPAY Sandbox — không thu tiền thật.</p>}
    {status?.method === "PAYOS" && <p className="mt-2 text-sm">payOS nhận chuyển khoản bằng tiền thật.</p>}
    {status?.cancelRequested && status.orderStatus !== "CANCELLED" && status.paymentStatus === "UNPAID" && <p className="mt-2 text-sm">Đã ghi nhận yêu cầu hủy; đang kiểm tra với cổng thanh toán.</p>}
    {status?.expiresAt && status.paymentStatus === "UNPAID" && <p className="mt-2 text-sm">Hạn thanh toán: {new Date(status.expiresAt).toLocaleString("vi-VN")}</p>}
    <div className="mt-4 flex flex-wrap gap-3">
      {allowPay && status?.canPay && <button disabled={busy} className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-50" onClick={() => act("pay")}>Tiếp tục thanh toán</button>}
      {status?.paymentStatus === "UNPAID" && <button disabled={busy} className="rounded-lg border px-4 py-2 disabled:opacity-50" onClick={() => act("refresh")}>Kiểm tra lại</button>}
      {status?.canCancel && <button disabled={busy} className="rounded-lg border px-4 py-2 disabled:opacity-50" onClick={() => act("cancel")}>Yêu cầu hủy đơn</button>}
    </div>
    {message && <p className="mt-3 text-sm">{message}</p>}
  </section>;
}
