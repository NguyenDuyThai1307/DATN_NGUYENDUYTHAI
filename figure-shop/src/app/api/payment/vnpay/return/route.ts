import { appUrl } from "@/lib/payment-config";
import { prisma } from "@/lib/prisma";
import { verifyVnpay, vnpayParams } from "@/services/payment/vnpay.provider";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const params = vnpayParams(new URL(request.url));
    verifyVnpay(params);
    const attempt = await prisma.paymentAttempt.findUnique({ where: { providerReference: params.vnp_TxnRef }, select: { provider: true, payment: { select: { orderId: true } } } });
    if (!attempt || attempt.provider !== "VNPAY") return Response.redirect(`${appUrl()}/account/orders`, 303);
    return Response.redirect(`${appUrl()}/checkout/payment-result?orderId=${encodeURIComponent(attempt.payment.orderId)}`, 303);
  } catch { return Response.json({ message: "Thông tin trả về không hợp lệ. Mở lịch sử đơn hàng để kiểm tra." }, { status: 400 }); }
}
