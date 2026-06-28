import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/permissions";
import { isRecordNotFoundError } from "@/lib/prisma-error";
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
  try {
    await archiveAdminProduct(id);
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    throw error;
  }

  return NextResponse.json({
    message: "Archived product",
  });
}
