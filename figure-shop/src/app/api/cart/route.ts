import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCartByUserId } from "@/services/cart.service";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const cart = await getCartByUserId(user.id);

  return NextResponse.json({
    cart,
  });
}