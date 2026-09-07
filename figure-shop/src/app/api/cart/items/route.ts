import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { StorefrontError } from "@/lib/storefront-error";
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
        message: "Dữ liệu sản phẩm trong giỏ không hợp lệ",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const item = await addProductToCart(
      user.id,
      parsed.data.productId,
      parsed.data.quantity,
    );

    return NextResponse.json(
      {
        message: "Đã thêm sản phẩm vào giỏ hàng",
        item,
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

    throw error;
  }
}
