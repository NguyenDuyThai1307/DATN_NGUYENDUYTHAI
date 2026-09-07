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
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
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
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
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

export async function getPromotionFormOptions(currentProductId?: string) {
  const [products, categories, brands] = await Promise.all([
    getProductsForPromotionForm(currentProductId),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { products, categories, brands };
}

function getPromotionTargetData(input: PromotionInput) {
  return {
    scope: input.scope,
    productId: input.scope === "PRODUCT" ? input.productId : null,
    categoryId: input.scope === "CATEGORY" ? input.categoryId : null,
    brandId: input.scope === "BRAND" ? input.brandId : null,
  };
}

export async function createAdminPromotion(input: PromotionInput) {
  return prisma.promotion.create({
    data: {
      ...getPromotionTargetData(input),
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
      ...getPromotionTargetData(input),
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
