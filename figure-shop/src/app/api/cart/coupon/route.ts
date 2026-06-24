import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  applyCouponToCart,
  removeCouponFromCart,
} from "@/services/cart.service";
import { applyCouponSchema } from "@/validations/coupon.schema";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = applyCouponSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid coupon code",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const cart = await applyCouponToCart(user.id, parsed.data.code);

    return NextResponse.json({
      message: "Coupon applied",
      coupon: cart.coupon,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cannot apply coupon";

    return NextResponse.json(
      { message },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  await removeCouponFromCart(user.id);

  return NextResponse.json({
    message: "Coupon removed",
  });
}