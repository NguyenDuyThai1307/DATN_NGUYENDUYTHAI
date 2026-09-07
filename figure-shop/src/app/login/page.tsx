import Link from "next/link";
import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams;

  const registerHref =
    redirect?.startsWith("/") && !redirect.startsWith("//")
      ? `/register?redirect=${encodeURIComponent(redirect)}`
      : "/register";

  return (
    <AuthPageShell
      title="Đăng nhập"
      description="Đăng nhập để quản lý tài khoản, giỏ hàng và đơn hàng."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link
            href={registerHref}
            className="font-medium text-zinc-950 underline underline-offset-4"
          >
            Đăng ký
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
