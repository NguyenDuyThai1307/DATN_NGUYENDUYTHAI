"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type RegisterField = "name" | "email" | "password" | "confirmPassword";

type FieldErrors = Partial<Record<RegisterField, string>>;

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestedRedirect = searchParams.get("redirect");
  const redirectTo =
    requestedRedirect?.startsWith("/") &&
    !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const nextErrors: FieldErrors = {};

    if (name.length < 2) {
      nextErrors.name = "Họ tên phải có ít nhất 2 ký tự.";
    }

    if (!email.includes("@")) {
      nextErrors.email = "Vui lòng nhập email hợp lệ.";
    }

    if (password.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Xác nhận mật khẩu không khớp.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 409) {
        setFieldErrors({
          email: "Email này đã được đăng ký.",
        });
        return;
      }

      if (!response.ok) {
        const serverErrors = data?.errors as
          | Partial<Record<"name" | "email" | "password", string[]>>
          | undefined;

        if (serverErrors) {
          setFieldErrors({
            name: serverErrors.name?.[0],
            email: serverErrors.email?.[0],
            password: serverErrors.password?.[0],
          });
        }

        setError(data?.message ?? "Không thể tạo tài khoản. Vui lòng thử lại.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Họ tên
        </label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          className="mt-2"
          placeholder="Nguyễn Văn A"
          aria-invalid={Boolean(fieldErrors.name)}
        />
        <FieldError message={fieldErrors.name} />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="mt-2"
          placeholder="you@example.com"
          aria-invalid={Boolean(fieldErrors.email)}
        />
        <FieldError message={fieldErrors.email} />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Mật khẩu
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="mt-2"
          placeholder="Tối thiểu 6 ký tự"
          aria-invalid={Boolean(fieldErrors.password)}
        />
        <FieldError message={fieldErrors.password} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Xác nhận mật khẩu
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="mt-2"
          placeholder="Nhập lại mật khẩu"
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
        />
        <FieldError message={fieldErrors.confirmPassword} />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </Button>
    </form>
  );
}
