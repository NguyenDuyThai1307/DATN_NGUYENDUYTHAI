import { prisma } from "@/lib/prisma";

export async function getAdminDashboardStats() {
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    pendingOrders,
    completedOrders,
    revenueResult,
    environmentTotals,
    liveTestTotal,
    needsReviewCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),
    prisma.order.count({
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        isTestOrder: false,
        status: { not: "CANCELLED" },
        payment: { is: { environment: "LIVE", needsReview: false } },
      },
      _sum: {
        total: true,
      },
    }),
    prisma.payment.groupBy({ by: ["environment"], where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: "PAID", environment: "LIVE", order: { isTestOrder: true } }, _sum: { amount: true } }),
    prisma.payment.count({ where: { needsReview: true } }),
  ]);

  return {
    totalProducts,
    totalOrders,
    totalUsers,
    pendingOrders,
    completedOrders,
    paidRevenue: revenueResult._sum.total ?? 0,
    demoRevenue: environmentTotals.find((row) => row.environment === "DEMO")?._sum.amount ?? 0,
    sandboxRevenue: environmentTotals.find((row) => row.environment === "SANDBOX")?._sum.amount ?? 0,
    legacyPaidRevenue: environmentTotals.find((row) => row.environment === "LEGACY")?._sum.amount ?? 0,
    liveTestRevenue: liveTestTotal._sum.amount ?? 0,
    needsReviewCount,
  };
}

export async function getRecentOrdersForAdmin() {
  return prisma.order.findMany({
    take: 5,
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
