import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/permissions";
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
  await requireStaff();

  const { id } = await params;
  try {
    await deactivateAdminPromotion(id);
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json(
        { message: "Promotion not found" },
        { status: 404 },
      );
    }

    throw error;
  }

  return NextResponse.json({
    message: "Promotion deactivated",
  });
}
