"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Email hoac mat khau khong dung");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Mat khau</label>
        <input
          name="password"
          type="password"
          required
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="123456"
        />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Dang dang nhap..." : "Dang nhap"}
      </button>
    </form>
  );
}