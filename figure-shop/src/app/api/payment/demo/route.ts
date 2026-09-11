import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markDemoPaymentAsPaid } from "@/services/payment.service";
import { z } from "zod";
import { assertSameOrigin, paymentError } from "@/lib/payment-http";

const demoPaymentSchema = z.object({
  orderId: z.string().min(1, "Vui lòng chọn đơn hàng"),
});

export async function POST(request: Request) {
  try { assertSameOrigin(request); } catch (error) { return paymentError(error); }
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = demoPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Dữ liệu thanh toán không hợp lệ",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const order = await markDemoPaymentAsPaid(parsed.data.orderId, user.id);

    return NextResponse.json({
      message: "Thanh toán thử nghiệm thành công",
      order,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 },
      );
    }

    throw error;
  }
}
