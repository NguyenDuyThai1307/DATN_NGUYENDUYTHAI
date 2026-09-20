import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/session-user";
import { AUTH_COOKIE_NAME } from "@/constants/auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await getSessionUser(token);
  } catch {
    return null;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
