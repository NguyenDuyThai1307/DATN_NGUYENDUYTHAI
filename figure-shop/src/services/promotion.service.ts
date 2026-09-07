import { Prisma } from "@/generated/prisma/client";
import {
  isPromotionActive,
  selectBestPromotion,
  type PromotionPricingInput,
} from "@/services/pricing.service";

export const productPromotionInclude = {
  promotion: true,
  category: {
    include: {
      promotions: true,
    },
  },
  categories: {
    include: {
      category: {
        include: {
          promotions: true,
        },
      },
    },
  },
  brand: {
    include: {
      promotions: true,
    },
  },
} satisfies Prisma.ProductInclude;

type ProductWithPromotionTargets = Prisma.ProductGetPayload<{
  include: typeof productPromotionInclude;
}>;

export function getEffectiveProductPromotion(
  product: ProductWithPromotionTargets,
  now = new Date(),
): PromotionPricingInput | null {
  const promotions = [
    product.promotion,
    ...(product.category?.promotions ?? []),
    ...product.categories.flatMap((link) => link.category.promotions),
    ...(product.brand?.promotions ?? []),
  ];

  const uniquePromotions = Array.from(
    new Map(
      promotions
        .filter((promotion): promotion is NonNullable<typeof promotion> =>
          Boolean(promotion),
        )
        .filter((promotion) => isPromotionActive(promotion, now))
        .map((promotion) => [promotion.id, promotion]),
    ).values(),
  );

  return selectBestPromotion(product.price, uniquePromotions, now);
}

export function withEffectiveProductPromotion<
  T extends ProductWithPromotionTargets,
>(product: T, now = new Date()) {
  return {
    ...product,
    promotion: getEffectiveProductPromotion(product, now),
  };
}
