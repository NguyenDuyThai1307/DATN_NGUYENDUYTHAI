import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/jwt";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/validations/auth.schema";
import { AUTH_COOKIE_NAME } from "@/constants/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Dữ liệu đăng nhập không hợp lệ",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Email hoặc mật khẩu không đúng" },
      { status: 401 },
    );
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    return NextResponse.json(
      { message: "Email hoặc mật khẩu không đúng" },
      { status: 401 },
    );
  }

  const token = await signJwt({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json({
    message: "Đăng nhập thành công",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}