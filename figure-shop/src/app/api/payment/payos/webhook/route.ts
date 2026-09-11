import { verifyPayos } from "@/services/payment/payos.provider";
import { applyPaymentResult } from "@/services/online-payment.service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let result;
  try {
    const raw = await request.text();
    if (raw.length > 32_768) return Response.json({ message: "Payload too large" }, { status: 413 });
    result = await verifyPayos(JSON.parse(raw));
  } catch { return Response.json({ message: "Invalid webhook" }, { status: 400 }); }
  try {
    const outcome = await applyPaymentResult("PAYOS", result);
    // Verified unknown references include provider registration probes. They never create orders.
    return Response.json({ received: true, result: outcome });
  } catch { return Response.json({ message: "Please retry" }, { status: 503 }); }
}
