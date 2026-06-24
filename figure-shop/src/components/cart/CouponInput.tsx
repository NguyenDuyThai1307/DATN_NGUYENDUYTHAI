"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type CouponInputProps = {
  coupon?: {
    code: string;
    name: string;
  } | null;
};

export function CouponInput({ coupon }: CouponInputProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!code.trim()) {
      setError("Vui long nhap ma coupon.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/cart/coupon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
      }),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Khong the ap dung coupon.");
      return;
    }

    setCode("");
    router.refresh();
  }

  async function handleRemove() {
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/cart/coupon", {
      method: "DELETE",
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Khong the go coupon.");
      return;
    }

    router.refresh();
  }

  if (coupon) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Da ap dung: {coupon.code}
            </p>
            <p className="mt-1 text-xs text-emerald-700">{coupon.name}</p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isSubmitting}
            onClick={handleRemove}
          >
            Go
          </Button>
        </div>

        {error ? (
          <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="space-y-2">
      <label htmlFor="couponCode" className="text-sm font-medium">
        Ma coupon
      </label>

      <div className="flex gap-2">
        <Input
          id="couponCode"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Nhap ma giam gia"
          disabled={isSubmitting}
        />

        <Button type="submit" size="sm" disabled={isSubmitting}>
          Ap dung
        </Button>
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </form>
  );
}