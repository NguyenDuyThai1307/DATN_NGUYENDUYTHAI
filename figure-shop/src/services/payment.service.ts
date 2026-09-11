import { prisma } from "@/lib/prisma";
import { demoPaymentEnabled } from "@/lib/payment-config";

export async function markDemoPaymentAsPaid(orderId: string, userId: string) {
  if (!demoPaymentEnabled()) throw new Error("Thanh toán demo đang tắt");
  return prisma.$transaction(async (tx) => {
  const order = await tx.order.findFirst({
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
  if (order.status === "CANCELLED" || order.paymentStatus === "REFUNDED") throw new Error("Đơn hàng không thể xác nhận thanh toán");

  if (order.paymentStatus === "PAID") {
    return order;
  }

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
        ...(order.status === "PENDING" ? { status: "CONFIRMED" } : {}),
      },
      include: {
        items: true,
        payment: true,
      },
    });
  });
}
