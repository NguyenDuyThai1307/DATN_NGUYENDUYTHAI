import { paymentError, paymentUser } from "@/lib/payment-http";
import { refreshPayment } from "@/services/online-payment.service";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  try {
    const user = await paymentUser(request, true);
    const result = await refreshPayment((await context.params).orderId, user.id, user.role !== "CUSTOMER", true);
    return Response.json(result, { status: result.orderStatus === "CANCELLED" ? 200 : 202 });
  } catch (error) { return paymentError(error); }
}
