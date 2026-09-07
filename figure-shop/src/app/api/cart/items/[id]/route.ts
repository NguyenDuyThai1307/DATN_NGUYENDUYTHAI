import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { StorefrontError } from "@/lib/storefront-error";
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
        message: "Dữ liệu sản phẩm trong giỏ không hợp lệ",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const item = await updateCartItemQuantity(
      user.id,
      id,
      parsed.data.quantity,
    );

    return NextResponse.json({
      message: "Đã cập nhật sản phẩm trong giỏ",
      item,
    });
  } catch (error) {
    if (error instanceof StorefrontError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    throw error;
  }
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
  try {
    await removeCartItem(user.id, id);

    return NextResponse.json({
      message: "Đã xóa sản phẩm khỏi giỏ",
    });
  } catch (error) {
    if (error instanceof StorefrontError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    throw error;
  }
}
