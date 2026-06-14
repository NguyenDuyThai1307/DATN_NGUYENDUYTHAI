import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByIdForUser } from "@/services/order.service";

type OrderRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: OrderRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const order = await getOrderByIdForUser(id, user.id);

  if (!order) {
    return NextResponse.json(
      { message: "Order not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    order,
  });
}