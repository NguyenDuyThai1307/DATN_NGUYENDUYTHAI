import { prisma } from "@/lib/prisma";
import type { CheckoutInput } from "@/validations/order.schema";
import {
  calculateLinePricing,
  calculateOrderPricing,
} from "@/services/pricing.service";

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

  const pricing = calculateOrderPricing(
    cart.items.map((item) => ({
      unitPrice: item.product.price,
      quantity: item.quantity,
      promotion: item.product.promotion,
    })),
    shippingFee,
);

  return prisma.$transaction(async (tx) => {
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

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
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