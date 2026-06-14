import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

type UserRole = "CUSTOMER" | "STAFF" | "ADMIN";

export function isStaffRole(role: UserRole) {
  return role === "STAFF" || role === "ADMIN";
}

export function isAdminRole(role: UserRole) {
  return role === "ADMIN";
}

export async function requireStaff() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (!isStaffRole(user.role)) {
    redirect("/");
  }

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (!isAdminRole(user.role)) {
    redirect("/admin");
  }

  return user;
}