import { prisma } from "@/lib/prisma";

export async function getAdminDashboardStats() {
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    pendingOrders,
    completedOrders,
    revenueResult,
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
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  return {
    totalProducts,
    totalOrders,
    totalUsers,
    pendingOrders,
    completedOrders,
    paidRevenue: revenueResult._sum.total ?? 0,
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