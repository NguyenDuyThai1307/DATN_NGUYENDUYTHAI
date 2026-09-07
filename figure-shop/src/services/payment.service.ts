import { prisma } from "@/lib/prisma";

export async function markDemoPaymentAsPaid(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      payment: true,
    },
  });

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  if (order.paymentMethod !== "DEMO") {
    throw new Error("Đơn hàng không sử dụng thanh toán thử nghiệm");
  }

  if (order.paymentStatus === "PAID") {
    return order;
  }

  return prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        orderId: order.id,
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
        transactionCode: `DEMO-${Date.now()}`,
      },
    });

    return tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
      include: {
        items: true,
        payment: true,
      },
    });
  });
}