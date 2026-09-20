import { adminUserApi, adminUserError } from "@/lib/admin-user-api";
import { listAdminUsers } from "@/services/admin-user.service";
export async function GET(request: Request) {
  try {
    await adminUserApi();
    return Response.json(await listAdminUsers(Object.fromEntries(new URL(request.url).searchParams)), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return adminUserError(error); }
}
