import { NextResponse } from "next/server";
import { authorizeStaffApi } from "@/lib/api-auth";
import { isRecordNotFoundError } from "@/lib/prisma-error";
import { deactivateAdminPromotion } from "@/services/admin-promotion.service";

type AdminPromotionRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: AdminPromotionRouteProps,
) {
  const authorization = await authorizeStaffApi();

  if (!authorization.ok) {
    return authorization.response;
  }

  const { id } = await params;
  try {
    await deactivateAdminPromotion(id);
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json(
        { message: "Không tìm thấy khuyến mãi" },
        { status: 404 },
      );
    }

    throw error;
  }

  return NextResponse.json({
    message: "Đã tắt khuyến mãi",
  });
}
