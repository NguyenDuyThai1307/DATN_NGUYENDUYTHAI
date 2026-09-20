import { adminUserApi, adminUserError } from "@/lib/admin-user-api";
import { getAdminUser, updateAdminUser } from "@/services/admin-user.service";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  try { await adminUserApi(); return Response.json({ user: await getAdminUser((await params).id) }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch (error) { return adminUserError(error); }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    const actor = await adminUserApi(request);
    const user = await updateAdminUser(actor.id, (await params).id, await request.json().catch(() => null));
    return Response.json({ user, message: "Đã cập nhật tài khoản. Các phiên đăng nhập cũ đã bị thu hồi nếu quyền hoặc trạng thái thay đổi." });
  } catch (error) { return adminUserError(error); }
}
