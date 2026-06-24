import { prisma } from "@/lib/prisma";
import type { CouponInput } from "@/validations/coupon.schema";

export async function getAdminCoupons() {
  return prisma.coupon.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });
}

export async function getAdminCouponById(id: string) {
  return prisma.coupon.findUnique({
    where: {
      id,
    },
  });
}

export async function createAdminCoupon(input: CouponInput) {
  return prisma.coupon.create({
    data: {
      code: input.code,
      name: input.name,
      type: input.type,
      value: input.value,
      minOrderValue: input.minOrderValue,
      maxDiscountAmount: input.maxDiscountAmount ?? null,
      usageLimit: input.usageLimit ?? null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isActive: input.isActive,
    },
  });
}

export async function updateAdminCoupon(id: string, input: CouponInput) {
  return prisma.coupon.update({
    where: {
      id,
    },
    data: {
      code: input.code,
      name: input.name,
      type: input.type,
      value: input.value,
      minOrderValue: input.minOrderValue,
      maxDiscountAmount: input.maxDiscountAmount ?? null,
      usageLimit: input.usageLimit ?? null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      isActive: input.isActive,
    },
  });
}

export async function deactivateAdminCoupon(id: string) {
  return prisma.coupon.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
}