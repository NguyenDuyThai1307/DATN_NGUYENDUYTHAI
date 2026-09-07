import { NextResponse } from "next/server";
import { authorizeStaffApi } from "@/lib/api-auth";
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
  const authorization = await authorizeStaffApi();

  if (!authorization.ok) {
    return authorization.response;
  }

  const { id } = await params;
  try {
    await deactivateAdminCoupon(id);
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json(
        { message: "Không tìm thấy coupon" },
        { status: 404 },
      );
    }

    throw error;
  }

  return NextResponse.json({
    message: "Đã tắt coupon",
  });
}
