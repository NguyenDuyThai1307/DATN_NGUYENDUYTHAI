import { paymentError, paymentUser } from "@/lib/payment-http";
import { paymentStatus } from "@/services/online-payment.service";
export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ orderId: string }> }) {
  try {
    const user = await paymentUser(request);
    return Response.json(await paymentStatus((await context.params).orderId, user.id, user.role !== "CUSTOMER"), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return paymentError(error); }
}
