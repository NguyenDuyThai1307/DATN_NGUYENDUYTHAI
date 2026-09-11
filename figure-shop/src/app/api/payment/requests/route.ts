import { z } from "zod";
import { paymentError, paymentIp, paymentUser, requestKey } from "@/lib/payment-http";
import { createPaymentRequest } from "@/services/online-payment.service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const user = await paymentUser(request, true);
    const parsed = z.object({ orderId: z.string().min(1).max(100) }).safeParse(await request.json());
    if (!parsed.success) return Response.json({ message: "Đơn hàng không hợp lệ" }, { status: 400 });
    const result = await createPaymentRequest(parsed.data.orderId, user.id, requestKey(request), paymentIp(request));
    return Response.json(result, { status: ["UNKNOWN", "CREATING"].includes(result.status) ? 202 : 200 });
  } catch (error) { return paymentError(error); }
}
