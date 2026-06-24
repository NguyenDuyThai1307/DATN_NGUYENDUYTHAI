import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/permissions";
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
  await deactivateAdminCoupon(id);

  return NextResponse.json({
    message: "Coupon deactivated",
  });
}