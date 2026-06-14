import { prisma } from "@/lib/prisma";
import type { CheckoutInput } from "@/validations/order.schema";

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
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const subtotal = cart.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        status: "PENDING",
        paymentMethod: input.paymentMethod,
        paymentStatus: "UNPAID",
        subtotal,
        shippingFee,
        total,
        note: input.note,
        receiverName: input.receiverName,
        receiverPhone: input.receiverPhone,
        province: input.province,
        district: input.district,
        ward: input.ward,
        addressDetail: input.addressDetail,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productPrice: item.product.price,
            quantity: item.quantity,
            total: item.product.price * item.quantity,
          })),
        },
        payment: {
          create: {
            amount: total,
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