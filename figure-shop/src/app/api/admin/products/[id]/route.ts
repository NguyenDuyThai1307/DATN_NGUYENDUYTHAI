import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/permissions";
import { archiveAdminProduct } from "@/services/admin-product.service";

type AdminProductRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: AdminProductRouteProps,
) {
  await requireStaff();

  const { id } = await params;
  await archiveAdminProduct(id);

  return NextResponse.json({
    message: "Archived product",
  });
}