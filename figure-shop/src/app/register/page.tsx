import Link from "next/link";
import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

type RegisterPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { redirect } = await searchParams;

  const loginHref =
    redirect?.startsWith("/") && !redirect.startsWith("//")
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : "/login";

  return (
    <AuthPageShell
      title="Tạo tài khoản"
      description="Đăng ký để lưu giỏ hàng và theo dõi đơn hàng của bạn."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link
            href={loginHref}
            className="font-medium text-zinc-950 underline underline-offset-4"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthPageShell>
  );
}
