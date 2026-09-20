import { prisma } from "@/lib/prisma";
import { buildRevenueReport } from "@/lib/admin-revenue";
import { dashboardRange, type DashboardRangeInput } from "@/lib/dashboard-range";

export const LOW_STOCK_THRESHOLD = 5;

export async function getDashboardOverview(input: DashboardRangeInput = {}, now = new Date()) {
  const range = dashboardRange(input, now);
  const current = { gte: range.start, lt: range.end };
  const previous = { gte: range.previousStart, lt: range.start };
  const lowStockWhere = { status: "ACTIVE" as const, type: "IN_STOCK" as const, stock: { lte: LOW_STOCK_THRESHOLD } };
  const [orders, previousOrders, newCustomers, previousCustomers, totalProducts, addedProducts, revenueOrders, recentOrders, customers, lowStock, lowStockCount, coupons, needsReviewCount] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], where: { createdAt: current }, _count: { _all: true } }),
    prisma.order.count({ where: { createdAt: previous } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: current } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: previous } }),
    prisma.product.count(),
    prisma.product.count({ where: { createdAt: current } }),
    prisma.order.findMany({
      where: {
        paymentMethod: { in: ["COD", "BANK_TRANSFER", "DEMO"] }, status: { not: "CANCELLED" },
        OR: [{ createdAt: { gte: range.previousStart, lt: range.end } }, { payment: { is: { paidAt: { gte: range.previousStart, lt: range.end } } } }],
      },
      select: {
        total: true, status: true, paymentStatus: true, paymentMethod: true, createdAt: true,
        payment: { select: { status: true, paidAt: true, needsReview: true } },
        items: { select: { productId: true, productName: true, quantity: true, total: true } },
      },
    }),
    prisma.order.findMany({ where: { createdAt: current }, take: 5, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { id: true, orderNumber: true, createdAt: true, total: true, status: true, user: { select: { name: true } } } }),
    prisma.user.findMany({ where: { role: "CUSTOMER", createdAt: current }, take: 5, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { id: true, name: true, createdAt: true, _count: { select: { orders: { where: { createdAt: current } } } } } }),
    prisma.product.findMany({ where: lowStockWhere, orderBy: [{ stock: "asc" }, { name: "asc" }], take: 4, select: { id: true, name: true, stock: true, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } } } }),
    prisma.product.count({ where: lowStockWhere }),
    prisma.coupon.findMany({ where: { createdAt: current }, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, code: true, createdAt: true } }),
    prisma.payment.count({ where: { needsReview: true } }),
  ]);
  const revenue = buildRevenueReport(revenueOrders, range.days, new Date(range.end.getTime() - 1));
  const sales = new Map<string, { id: string | null; name: string; quantity: number; total: number }>();
  for (const order of revenueOrders) {
    if (order.paymentStatus !== "PAID" || order.payment?.status !== "PAID" || order.payment.needsReview) continue;
    const paidAt = order.payment.paidAt ?? order.createdAt;
    if (paidAt < range.start || paidAt >= range.end) continue;
    for (const item of order.items) {
      const key = item.productId ?? `deleted:${item.productName}`;
      const row = sales.get(key) ?? { id: item.productId, name: item.productName, quantity: 0, total: 0 };
      row.quantity += item.quantity; row.total += item.total; sales.set(key, row);
    }
  }
  const topSales = [...sales.values()].sort((a, b) => b.quantity - a.quantity || b.total - a.total || a.name.localeCompare(b.name)).slice(0, 4);
  const saleProducts = await prisma.product.findMany({ where: { id: { in: topSales.flatMap(row => row.id ? [row.id] : []) } }, select: { id: true, images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } } } });
  const bestSellers = topSales.map(row => ({ ...row, image: saleProducts.find(product => product.id === row.id)?.images[0]?.url ?? null }));
  const statusCount = (statuses: string[]) => orders.filter(order => statuses.includes(order.status)).reduce((sum, row) => sum + row._count._all, 0);
  const statuses = [
    { label: "Chờ / đang xử lý", count: statusCount(["PENDING", "CONFIRMED", "PROCESSING"]), color: "#d4d8df" },
    { label: "Đang giao", count: statusCount(["SHIPPED"]), color: "#a9b0ba" },
    { label: "Hoàn thành", count: statusCount(["COMPLETED"]), color: "#737d8a" },
    { label: "Đã hủy", count: statusCount(["CANCELLED"]), color: "#424b58" },
  ];
  const activities = [
    ...recentOrders.map(order => ({ id: `order:${order.id}`, kind: "order" as const, text: `Đơn hàng ${order.orderNumber} được tạo`, at: order.createdAt, href: `/admin/orders/${order.id}` })),
    ...customers.map(user => ({ id: `user:${user.id}`, kind: "customer" as const, text: `${user.name || "Khách hàng"} đăng ký tài khoản`, at: user.createdAt, href: `/admin/users/${user.id}` })),
    ...coupons.map(coupon => ({ id: `coupon:${coupon.id}`, kind: "coupon" as const, text: `Mã giảm giá ${coupon.code} được tạo`, at: coupon.createdAt, href: `/admin/coupons/${coupon.id}/edit` })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 4);
  return { range, revenue, statuses, totalOrders: statuses.reduce((sum, row) => sum + row.count, 0), previousOrders, newCustomers, previousCustomers, totalProducts, addedProducts, recentOrders, customers, bestSellers, lowStock, lowStockCount, activities, needsReviewCount };
}

export type DashboardOverview = Awaited<ReturnType<typeof getDashboardOverview>>;
