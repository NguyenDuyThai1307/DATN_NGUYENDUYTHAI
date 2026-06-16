import { NextResponse, type NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";
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
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifyJwt(token);

    if (isStaffPath(pathname) && payload.role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*"],
};