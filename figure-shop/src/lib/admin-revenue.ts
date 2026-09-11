const DAY = 86_400_000;
const OFFSET = 7 * 3_600_000;

export type RevenueOrder = {
  total: number; status: string; paymentStatus: string; paymentMethod: string;
  createdAt: Date;
  payment: { status: string; paidAt: Date | null; needsReview: boolean } | null;
};

export function revenueWindow(days: number, now = new Date()) {
  const end = new Date(Math.floor((now.getTime() + OFFSET) / DAY) * DAY - OFFSET + DAY);
  return { start: new Date(end.getTime() - days * DAY), previousStart: new Date(end.getTime() - days * 2 * DAY), end };
}

export function buildRevenueReport(orders: RevenueOrder[], days: number, now = new Date()) {
  const { start, previousStart, end } = revenueWindow(days, now);
  const daily = Array.from({ length: days }, (_, index) => ({
    date: new Date(start.getTime() + index * DAY).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit" }),
    cod: 0, transfer: 0, count: 0,
  }));
  let previous = 0, paidCount = 0, pending = 0, pendingCount = 0, estimatedDates = 0;
  for (const order of orders) {
    if (!["COD", "BANK_TRANSFER", "DEMO"].includes(order.paymentMethod) || order.status === "CANCELLED") continue;
    if (order.paymentStatus === "UNPAID" && order.createdAt >= start && order.createdAt < end) {
      pending += order.total; pendingCount++;
    }
    if (order.paymentStatus !== "PAID" || order.payment?.status !== "PAID" || order.payment.needsReview) continue;
    const date = order.payment.paidAt ?? order.createdAt;
    if (date >= previousStart && date < start) previous += order.total;
    if (date < start || date >= end) continue;
    const row = daily[Math.floor((date.getTime() - start.getTime()) / DAY)];
    row[order.paymentMethod === "COD" ? "cod" : "transfer"] += order.total;
    row.count++; paidCount++;
    if (!order.payment.paidAt) estimatedDates++;
  }
  const cod = daily.reduce((sum, row) => sum + row.cod, 0);
  const transfer = daily.reduce((sum, row) => sum + row.transfer, 0);
  return { days, daily, cod, transfer, total: cod + transfer, previous, paidCount, pending, pendingCount, estimatedDates };
}

export type RevenueReport = ReturnType<typeof buildRevenueReport>;
