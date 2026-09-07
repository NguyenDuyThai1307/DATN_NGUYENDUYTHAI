import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { StorefrontError } from "@/lib/storefront-error";
import {
  createOrderFromCart,
  getOrdersByUserId,
} from "@/services/order.service";
import { checkoutSchema } from "@/validations/order.schema";
import { CouponValidationError } from "@/services/coupon.service";

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
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
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
    const order = await createOrderFromCart(user.id, parsed.data);

    return NextResponse.json(
      {
        message: "Tạo đơn hàng thành công",
        order,
      },
      { status: 201 },
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
    throw error;
  }
}
