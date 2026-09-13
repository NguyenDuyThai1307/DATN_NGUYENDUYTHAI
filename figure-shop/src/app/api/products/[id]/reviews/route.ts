import { getCurrentUser } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/same-origin";
import { StorefrontError } from "@/lib/storefront-error";
import { deleteProductReview, getProductReviews, saveProductReview } from "@/services/review.service";

type Context = { params: Promise<{ id: string }> };
function failure(error: unknown) {
  if (error instanceof StorefrontError) return Response.json({ message: error.message }, { status: error.status });
  console.error("Review request failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ message: "Không thể xử lý đánh giá. Vui lòng thử lại." }, { status: 500 });
}
export async function GET(request: Request, { params }: Context) {
  try {
    const user = await getCurrentUser();
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    if (!Number.isSafeInteger(page) || page < 1) throw new StorefrontError("Trang không hợp lệ.");
    return Response.json(await getProductReviews((await params).id, user?.id ?? null, page), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return failure(error); }
}
async function mutate(request: Request, context: Context, remove: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new StorefrontError("Vui lòng đăng nhập để đánh giá.", 401);
    if (!isSameOriginRequest(request)) throw new StorefrontError("Nguồn yêu cầu không hợp lệ.", 403);
    if (request.headers.get("x-account-id") !== user.id) throw new StorefrontError("Tài khoản đã thay đổi. Vui lòng tải lại trang.", 409);
    const { id } = await context.params;
    if (remove) await deleteProductReview(user.id, id);
    else await saveProductReview(user.id, id, await request.json().catch(() => null));
    return Response.json({ message: remove ? "Đã xóa đánh giá." : "Đã lưu đánh giá của bạn." });
  } catch (error) { return failure(error); }
}
export async function PUT(request: Request, context: Context) { return mutate(request, context, false); }
export async function DELETE(request: Request, context: Context) { return mutate(request, context, true); }
