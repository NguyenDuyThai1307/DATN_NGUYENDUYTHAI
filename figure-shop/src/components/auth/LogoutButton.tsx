"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setIsSubmitting(false);
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? "Đang thoát..." : "Đăng xuất"}
    </button>
  );
}