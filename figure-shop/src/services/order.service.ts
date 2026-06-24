import { prisma } from "@/lib/prisma";
import type { CheckoutInput } from "@/validations/order.schema";
import {
  calculateLinePricing,
  calculateOrderPricing,
} from "@/services/pricing.service";
import {
  CouponValidationError,
  getCouponValidationError,
} from "@/services/coupon.service";

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `FS-${timestamp}-${random}`;
}

export async function createOrderFromCart(
  userId: string,
  input: CheckoutInput,
) {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      coupon: true,
      items: {
        include: {
          product: {
            include: {
              promotion: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const shippingFee = 0;

  const pricingItems = cart.items.map((item) => ({
    unitPrice: item.product.price,
    quantity: item.quantity,
    promotion: item.product.promotion,
  }));

  const pricingWithoutCoupon = calculateOrderPricing(
    pricingItems,
    shippingFee,
  );

  const amountAfterProductDiscount =
    pricingWithoutCoupon.subtotal -
    pricingWithoutCoupon.productDiscountAmount;

  return prisma.$transaction(async (tx) => {
    let coupon = cart.coupon;

    if (coupon) {
      const latestCoupon = await tx.coupon.findUnique({
        where: {
          id: coupon.id,
        },
      });

      if (!latestCoupon) {
        throw new CouponValidationError("Coupon not found");
      }

      const couponError = getCouponValidationError(
        latestCoupon,
        amountAfterProductDiscount,
      );

      if (couponError) {
        throw new CouponValidationError(couponError);
      }

      coupon = latestCoupon;
    }

    const pricing = calculateOrderPricing(
      pricingItems,
      shippingFee,
      coupon,
    );

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        status: "PENDING",
        paymentMethod: input.paymentMethod,
        paymentStatus: "UNPAID",
        subtotal: pricing.subtotal,
        discountAmount: pricing.discountAmount,
        shippingFee: pricing.shippingFee,
        total: pricing.total,
        note: input.note,
        couponId: coupon?.id,
        couponCode: coupon?.code,
        couponDiscountAmount: pricing.couponDiscountAmount,
        receiverName: input.receiverName,
        receiverPhone: input.receiverPhone,
        province: input.province,
        district: input.district,
        ward: input.ward,
        addressDetail: input.addressDetail,
        items: {
          create: cart.items.map((item) => {
            const linePricing = calculateLinePricing({
              unitPrice: item.product.price,
              quantity: item.quantity,
              promotion: item.product.promotion,
            });

            return {
              productId: item.productId,
              productName: item.product.name,
              productPrice: linePricing.finalUnitPrice,
              originalPrice: linePricing.unitPrice,
              finalPrice: linePricing.finalUnitPrice,
              discountAmount: linePricing.discountAmount,
              quantity: item.quantity,
              total: linePricing.finalTotal,
            };
          }),
        },
        payment: {
          create: {
            amount: pricing.total,
            method: input.paymentMethod,
            status: "UNPAID",
          },
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    if (coupon && pricing.couponDiscountAmount > 0) {
      await tx.coupon.update({
        where: {
          id: coupon.id,
        },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    await tx.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        couponId: null,
      },
    });

    return order;
  });
}

export async function getOrdersByUserId(userId: string) {
  return prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      items: true,
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getOrderByIdForUser(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: true,
      payment: true,
    },
  });
}