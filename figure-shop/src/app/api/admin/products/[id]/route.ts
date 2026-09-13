import { NextResponse } from "next/server";
import { authorizeStaffApi } from "@/lib/api-auth";
import { isRecordNotFoundError } from "@/lib/prisma-error";
import { archiveAdminProduct } from "@/services/admin-product.service";
import { updateProductAvailability } from "@/services/admin-product.service";
import { productAvailabilitySchema } from "@/validations/product.schema";
import { isSameOriginRequest } from "@/lib/same-origin";

type AdminProductRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: AdminProductRouteProps) {
  const authorization = await authorizeStaffApi();
  if (!authorization.ok) return authorization.response;
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Nguồn yêu cầu không hợp lệ" }, { status: 403 });
  }
  const parsed = productAvailabilitySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Chọn loại hàng và nhập tồn kho là số nguyên không âm." }, { status: 400 });
  const { id } = await params;
  try {
    const product = await updateProductAvailability(id, parsed.data);
    return NextResponse.json({ message: "Đã cập nhật loại hàng", product: { id: product.id, type: product.type, stock: product.stock } });
  } catch (error) {
    if (isRecordNotFoundError(error)) return NextResponse.json({ message: "Không tìm thấy sản phẩm" }, { status: 404 });
    throw error;
  }
}

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
