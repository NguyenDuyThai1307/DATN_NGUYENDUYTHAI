import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isStaffRole } from "@/lib/permissions";

export async function authorizeStaffApi() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  if (!isStaffRole(user.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden" },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    user,
  };
}
