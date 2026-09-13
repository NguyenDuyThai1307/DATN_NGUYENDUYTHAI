import { prisma } from "@/lib/prisma";
import { StorefrontError } from "@/lib/storefront-error";
import { reviewSchema } from "@/validations/review.schema";

async function activeProduct(productId: string) {
  if (!await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE" }, select: { id: true } })) {
    throw new StorefrontError("Không tìm thấy sản phẩm.", 404);
  }
}

export async function canReview(userId: string, productId: string) {
  return Boolean(await prisma.orderItem.findFirst({ where: { productId, order: { userId, status: "COMPLETED" } }, select: { id: true } }));
}

export async function getProductReviews(productId: string, userId: string | null, requestedPage = 1) {
  await activeProduct(productId);
  const [summary, groups, ownReview, eligible] = await Promise.all([
    prisma.productReview.aggregate({ where: { productId }, _avg: { rating: true }, _count: true }),
    prisma.productReview.groupBy({ by: ["rating"], where: { productId }, _count: true }),
    userId ? prisma.productReview.findUnique({ where: { userId_productId: { userId, productId } }, select: { rating: true, comment: true } }) : null,
    userId ? canReview(userId, productId) : false,
  ]);
  const pages = Math.max(1, Math.ceil(summary._count / 5));
  const page = Math.max(1, Math.min(requestedPage, pages));
  const reviews = await prisma.productReview.findMany({ where: { productId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * 5, take: 5,
    select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true, user: { select: { name: true } } },
  });
  return {
    total: summary._count, average: summary._avg.rating ?? 0, page, pages, ownReview, eligible,
    distribution: [5, 4, 3, 2, 1].map(rating => ({ rating, count: groups.find(group => group.rating === rating)?._count ?? 0 })),
    reviews: reviews.map(({ user, ...review }) => ({ ...review, author: user.name?.trim() || "Khách hàng", createdAt: review.createdAt.toISOString(), updatedAt: review.updatedAt.toISOString() })),
  };
}

export async function saveProductReview(userId: string, productId: string, input: unknown) {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) throw new StorefrontError(parsed.error.issues[0]?.message ?? "Đánh giá không hợp lệ.");
  await activeProduct(productId);
  if (!await canReview(userId, productId)) throw new StorefrontError("Bạn chỉ có thể đánh giá sản phẩm trong đơn hàng đã hoàn thành.", 403);
  return prisma.productReview.upsert({ where: { userId_productId: { userId, productId } }, create: { userId, productId, ...parsed.data }, update: parsed.data });
}

export async function deleteProductReview(userId: string, productId: string) {
  await prisma.productReview.deleteMany({ where: { userId, productId } });
}
