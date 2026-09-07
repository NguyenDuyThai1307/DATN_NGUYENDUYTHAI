import { prisma } from "@/lib/prisma";
import { StorefrontError } from "@/lib/storefront-error";
import type { CheckoutInput } from "@/validations/order.schema";
import {
  calculateLinePricing,
  calculateOrderPricing,
} from "@/services/pricing.service";
import {
  CouponValidationError,
  getCouponValidationError,
} from "@/services/coupon.service";
import {
  getEffectiveProductPromotion,
  productPromotionInclude,
} from "@/services/promotion.service";

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `FS-${timestamp}-${random}`;
}

export async function createOrderFromCart(
  userId: string,
  input: CheckoutInput,
) {
  const shippingFee = 0;

  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const cart = await tx.cart.findUnique({
      where: {
        userId,
      },
      include: {
        coupon: true,
        items: {
          include: {
            product: {
              include: {
                ...productPromotionInclude,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new StorefrontError("Giỏ hàng đang trống");
    }

    for (const item of cart.items) {
      if (item.product.status !== "ACTIVE") {
        throw new StorefrontError(
          `${item.product.name} hiện không mở bán`,
          409,
        );
      }

      if (
        item.product.type === "IN_STOCK" &&
        item.quantity > item.product.stock
      ) {
        throw new StorefrontError(
          `${item.product.name} chỉ còn ${item.product.stock} sản phẩm`,
          409,
        );
      }
    }

    const promotionsByProductId = new Map(
      cart.items.map((item) => [
        item.productId,
        getEffectiveProductPromotion(item.product, now),
      ]),
    );
    const pricingItems = cart.items.map((item) => ({
      unitPrice: item.product.price,
      quantity: item.quantity,
      promotion: promotionsByProductId.get(item.productId),
    }));

    const pricingWithoutCoupon = calculateOrderPricing(
      pricingItems,
      shippingFee,
      undefined,
      now,
    );

    const amountAfterProductDiscount =
      pricingWithoutCoupon.subtotal -
      pricingWithoutCoupon.productDiscountAmount;

    let coupon = cart.coupon;

    if (coupon) {
      const latestCoupon = await tx.coupon.findUnique({
        where: {
          id: coupon.id,
        },
      });

      if (!latestCoupon) {
        throw new CouponValidationError("Không tìm thấy coupon");
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
      now,
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
            const linePricing = calculateLinePricing(
              {
                unitPrice: item.product.price,
                quantity: item.quantity,
                promotion: promotionsByProductId.get(item.productId),
              },
              now,
            );

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

    for (const item of cart.items) {
      if (item.product.type === "IN_STOCK") {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
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
