import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createOrderFromCart,
  getOrdersByUserId,
} from "@/services/order.service";
import { checkoutSchema } from "@/validations/order.schema";

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
        message: "Invalid checkout data",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const order = await createOrderFromCart(user.id, parsed.data);

    return NextResponse.json(
      {
        message: "Created order successfully",
        order,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Cart is empty") {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 },
      );
    }

    throw error;
  }
}