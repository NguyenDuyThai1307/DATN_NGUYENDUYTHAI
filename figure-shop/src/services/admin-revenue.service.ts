import { prisma } from "@/lib/prisma";
import { buildRevenueReport, revenueWindow } from "@/lib/admin-revenue";

export async function getAdminRevenueReport(days: number) {
  const now = new Date();
  const { previousStart, end } = revenueWindow(days, now);
  const orders = await prisma.order.findMany({
    where: {
      paymentMethod: { in: ["COD", "BANK_TRANSFER", "DEMO"] },
      status: { not: "CANCELLED" },
      OR: [
        { createdAt: { gte: previousStart, lt: end } },
        { payment: { is: { paidAt: { gte: previousStart, lt: end } } } },
      ],
    },
    select: {
      total: true, status: true, paymentStatus: true, paymentMethod: true, createdAt: true,
      payment: { select: { status: true, paidAt: true, needsReview: true } },
    },
  });
  return buildRevenueReport(orders, days, now);
}
