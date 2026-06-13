import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  removeCartItem,
  updateCartItemQuantity,
} from "@/services/cart.service";
import { updateCartItemSchema } from "@/validations/cart.schema";

type CartItemRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: CartItemRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateCartItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid cart item data",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const item = await updateCartItemQuantity(user.id, id, parsed.data.quantity);

  return NextResponse.json({
    message: "Updated cart item",
    item,
  });
}

export async function DELETE(_request: Request, { params }: CartItemRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  await removeCartItem(user.id, id);

  return NextResponse.json({
    message: "Removed cart item",
  });
}