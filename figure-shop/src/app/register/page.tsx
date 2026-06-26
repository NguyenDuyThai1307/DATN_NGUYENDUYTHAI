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
      title="Tao tai khoan"
      description="Dang ky de luu gio hang va theo doi don hang cua ban."
      footer={
        <>
          Da co tai khoan?{" "}
          <Link
            href={loginHref}
            className="font-medium text-zinc-950 underline underline-offset-4"
          >
            Dang nhap
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