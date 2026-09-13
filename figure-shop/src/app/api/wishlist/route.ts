import { getCurrentUser } from "@/lib/auth";
import { saveWishlistItem, wishlistIds } from "@/services/account-data.service";
import { z } from "zod";
import { isSameOriginRequest } from "@/lib/same-origin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  return Response.json({ ids: await wishlistIds(user.id) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  if (request.headers.get("x-account-id") !== user.id) return Response.json({ message: "Tài khoản đã thay đổi. Vui lòng tải lại trang." }, { status: 409 });
  if (!isSameOriginRequest(request)) return Response.json({ message: "Nguồn yêu cầu không hợp lệ." }, { status: 403 });
  const parsed = z.object({ productId: z.string().min(1).max(100), saved: z.boolean() }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 });
  if (!await saveWishlistItem(user.id, parsed.data.productId, parsed.data.saved)) return Response.json({ message: "Sản phẩm không còn khả dụng." }, { status: 404 });
  return Response.json({ ids: await wishlistIds(user.id) });
}
