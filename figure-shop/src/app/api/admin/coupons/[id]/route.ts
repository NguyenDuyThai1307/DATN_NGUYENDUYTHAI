import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/permissions";
import { isRecordNotFoundError } from "@/lib/prisma-error";
import { deactivateAdminCoupon } from "@/services/admin-coupon.service";

type AdminCouponRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: AdminCouponRouteProps,
) {
  await requireStaff();

  const { id } = await params;
  try {
    await deactivateAdminCoupon(id);
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 },
      );
    }

    throw error;
  }

  return NextResponse.json({
    message: "Coupon deactivated",
  });
}
