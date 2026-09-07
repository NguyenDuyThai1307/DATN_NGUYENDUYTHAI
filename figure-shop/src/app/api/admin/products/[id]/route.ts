import { NextResponse } from "next/server";
import { authorizeStaffApi } from "@/lib/api-auth";
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
  const authorization = await authorizeStaffApi();

  if (!authorization.ok) {
    return authorization.response;
  }

  const { id } = await params;
  try {
    await archiveAdminProduct(id);
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm" },
        { status: 404 },
      );
    }

    throw error;
  }

  return NextResponse.json({
    message: "Đã lưu trữ sản phẩm",
  });
}
