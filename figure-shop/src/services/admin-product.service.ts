import { prisma } from "@/lib/prisma";

export async function getProductsForAdmin() {
  return prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}