import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { StorefrontError } from "@/lib/storefront-error";
import {
  createOrderFromCart,
  getOrdersByUserId,
} from "@/services/order.service";
import { checkoutSchema } from "@/validations/order.schema";
import { CouponValidationError } from "@/services/coupon.service";
import { assertSameOrigin, paymentError, requestKey } from "@/lib/payment-http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const orders = await getOrdersByUserId(user.id);

  return NextResponse.json({
    orders,
  });
}

export async function POST(request: Request) {
  try { assertSameOrigin(request); requestKey(request); } catch (error) { return paymentError(error); }
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Thông tin thanh toán không hợp lệ",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const replay = await prisma.order.findUnique({ where: { userId_checkoutKey: { userId: user.id, checkoutKey: requestKey(request) } }, select: { id: true } });
    const order = await createOrderFromCart(user.id, parsed.data, requestKey(request));

    return NextResponse.json(
      {
        message: "Tạo đơn hàng thành công",
        order,
      },
      { status: replay ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof StorefrontError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    if (error instanceof CouponValidationError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 },
      );
    }
    return paymentError(error);
  }
}
