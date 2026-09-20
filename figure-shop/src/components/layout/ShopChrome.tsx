"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
export function ShopChrome({ children }: { children: ReactNode }) {
  const path = usePathname();
  return path === "/admin" || path.startsWith("/admin/") ? null : <>{children}</>;
}
