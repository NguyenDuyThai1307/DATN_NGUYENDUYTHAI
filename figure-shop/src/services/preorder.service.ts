import { prisma } from "@/lib/prisma";

export async function getActivePreorderProducts() {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      type: "PREORDER",
    },
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