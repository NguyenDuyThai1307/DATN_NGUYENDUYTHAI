import { verifyVnpay, vnpayParams, vnpayResult } from "@/services/payment/vnpay.provider";
import { applyPaymentResult } from "@/services/online-payment.service";
export const runtime = "nodejs";
export async function GET(request: Request) {
  let result;
  try {
    const params = vnpayParams(new URL(request.url));
    verifyVnpay(params);
    result = vnpayResult(params);
  } catch { return Response.json({ RspCode: "97", Message: "Invalid signature or parameters" }); }
  try {
    const outcome = await applyPaymentResult("VNPAY", result);
    const codes = { APPLIED: "00", DUPLICATE: "02", NOT_FOUND: "01", AMOUNT_MISMATCH: "04", INVALID: "97" };
    return Response.json({ RspCode: codes[outcome], Message: outcome });
  } catch { return Response.json({ RspCode: "99", Message: "Please retry" }); }
}
