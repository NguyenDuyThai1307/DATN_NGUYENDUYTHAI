import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/permissions";
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
  await deactivateAdminPromotion(id);

  return NextResponse.json({
    message: "Promotion deactivated",
  });
}