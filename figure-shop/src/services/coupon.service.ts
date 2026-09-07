import { prisma } from "@/lib/prisma";
export class CouponValidationError extends Error {}

type CouponForValidation = {
  isActive: boolean;
  startsAt: Date;
  endsAt: Date;
  usageLimit: number | null;
  usedCount: number;
  minOrderValue: number;
};

export async function getCouponByCode(code: string) {
  return prisma.coupon.findUnique({
    where: {
      code: code.trim().toUpperCase(),
    },
  });
}

export function getCouponValidationError(
  coupon: CouponForValidation,
  orderAmount: number,
  now = new Date(),
) {
  if (!coupon.isActive) {
    return "Coupon đang không hoạt động";
  }

  if (coupon.startsAt > now) {
    return "Coupon chưa đến thời gian áp dụng";
  }

  if (coupon.endsAt < now) {
    return "Coupon đã hết hạn";
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return "Coupon đã đạt giới hạn sử dụng";
  }

  if (orderAmount < coupon.minOrderValue) {
    return `Minimum order value is ${coupon.minOrderValue}`;
  }

  return null;
}

export async function getFeaturedCoupon() {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      startsAt: {
        lte: now,
      },
      endsAt: {
        gte: now,
      },
    },
    orderBy: {
      value: "desc",
    },
  });

  return (
    coupons.find(
      (coupon) =>
        coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit,
    ) ?? null
  );
}
