import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addProductToCart } from "@/services/cart.service";
import { addToCartSchema } from "@/validations/cart.schema";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = addToCartSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid cart item data",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const item = await addProductToCart(user.id, parsed.data.productId);

  return NextResponse.json(
    {
      message: "Added product to cart",
      item,
    },
    { status: 201 },
  );
}