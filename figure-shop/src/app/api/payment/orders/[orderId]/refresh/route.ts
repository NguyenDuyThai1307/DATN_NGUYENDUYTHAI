import { paymentError, paymentUser } from "@/lib/payment-http";
import { refreshPayment } from "@/services/online-payment.service";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  try {
    const user = await paymentUser(request, true);
    const result = await refreshPayment((await context.params).orderId, user.id, user.role !== "CUSTOMER");
    return Response.json(result, { status: result.paymentStatus === "UNPAID" ? 202 : 200 });
  } catch (error) { return paymentError(error); }
}
