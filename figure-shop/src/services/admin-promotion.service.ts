import { prisma } from "@/lib/prisma";
import type { PromotionInput } from "@/validations/promotion.schema";

export async function getAdminPromotions() {
  return prisma.promotion.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
        },
      },
    },
  });
}

export async function getAdminPromotionById(id: string) {
  return prisma.promotion.findUnique({
    where: {
      id,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
        },
      },
    },
  });
}

export async function getProductsForPromotionForm(
  currentProductId?: string,
) {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        {
          promotion: {
            is: null,
          },
        },
        ...(currentProductId
          ? [
              {
                id: currentProductId,
              },
            ]
          : []),
      ],
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });
}

export async function createAdminPromotion(input: PromotionInput) {
  return prisma.promotion.create({
    data: {
      productId: input.productId,
      name: input.name,
      type: input.type,
      value: input.value,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isActive: input.isActive,
    },
  });
}

export async function updateAdminPromotion(
  id: string,
  input: PromotionInput,
) {
  return prisma.promotion.update({
    where: {
      id,
    },
    data: {
      productId: input.productId,
      name: input.name,
      type: input.type,
      value: input.value,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isActive: input.isActive,
    },
  });
}

export async function deactivateAdminPromotion(id: string) {
  return prisma.promotion.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
}