import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "figure_shop_token";

export async function POST() {
  const response = NextResponse.json({
    message: "Logout successfully",
  });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}