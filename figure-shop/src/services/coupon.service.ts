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
    return "Coupon is inactive";
  }

  if (coupon.startsAt > now) {
    return "Coupon has not started yet";
  }

  if (coupon.endsAt < now) {
    return "Coupon has expired";
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return "Coupon usage limit reached";
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
