import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { AUTH_COOKIE_NAME } from "@/constants/auth";

const protectedRoutes = ["/account", "/checkout", "/cart"];
const staffRoutes = ["/admin"];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function isStaffPath(pathname: string) {
  return staffRoutes.some((route) => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth = isProtectedPath(pathname) || isStaffPath(pathname);

  if (!requiresAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);

    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = await getSessionUser(token);
    if (!user) throw new Error("Session expired");

    if (isStaffPath(pathname) && user.role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if ((pathname === "/admin/users" || pathname.startsWith("/admin/users/")) && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);

    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/account/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/admin/:path*",
  ],
};
