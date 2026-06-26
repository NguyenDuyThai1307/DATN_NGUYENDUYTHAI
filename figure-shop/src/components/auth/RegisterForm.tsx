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
      nextErrors.name = "Ho ten phai co it nhat 2 ky tu.";
    }

    if (!email.includes("@")) {
      nextErrors.email = "Vui long nhap email hop le.";
    }

    if (password.length < 6) {
      nextErrors.password = "Mat khau phai co it nhat 6 ky tu.";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Xac nhan mat khau khong khop.";
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
          email: "Email nay da duoc dang ky.",
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

        setError(data?.message ?? "Khong the tao tai khoan. Vui long thu lai.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Khong the ket noi den server. Vui long thu lai.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Ho ten
        </label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          className="mt-2"
          placeholder="Nguyen Van A"
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
          Mat khau
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="mt-2"
          placeholder="Toi thieu 6 ky tu"
          aria-invalid={Boolean(fieldErrors.password)}
        />
        <FieldError message={fieldErrors.password} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Xac nhan mat khau
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="mt-2"
          placeholder="Nhap lai mat khau"
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
        {isSubmitting ? "Dang tao tai khoan..." : "Tao tai khoan"}
      </Button>
    </form>
  );
}