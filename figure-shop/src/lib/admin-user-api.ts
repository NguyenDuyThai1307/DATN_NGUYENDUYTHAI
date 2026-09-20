import { getCurrentUser } from "@/lib/auth";
import { StorefrontError } from "@/lib/storefront-error";
import { isSameOriginRequest } from "@/lib/same-origin";
export async function adminUserApi(request?: Request) {
  const user = await getCurrentUser();
  if (!user) throw new StorefrontError("Vui lòng đăng nhập.", 401);
  if (user.role !== "ADMIN") throw new StorefrontError("Chỉ quản trị viên được quản lý người dùng.", 403);
  if (request && !isSameOriginRequest(request)) throw new StorefrontError("Nguồn yêu cầu không hợp lệ.", 403);
  return user;
}
export function adminUserError(error: unknown) {
  if (error instanceof StorefrontError) return Response.json({ message: error.message }, { status: error.status });
  console.error("Admin user request failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ message: "Không thể xử lý yêu cầu. Vui lòng thử lại." }, { status: 500 });
}
