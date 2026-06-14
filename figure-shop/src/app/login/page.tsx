import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-bold tracking-tight">Login</h1>
      <p className="mt-3 text-zinc-600">
        Dang nhap de quan ly tai khoan, gio hang va don hang.
      </p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}