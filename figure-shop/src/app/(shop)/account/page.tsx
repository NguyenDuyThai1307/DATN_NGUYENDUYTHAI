import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, LogOut, ShoppingBag, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AccountProfileForm } from "@/components/account/AccountProfileForm";
import { getCurrentUser } from "@/lib/auth";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  const canViewRole = user.role === "STAFF" || user.role === "ADMIN";

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tài khoản" },
        ]}
      />

      <div className="mt-6 rounded-3xl bg-gradient-to-br from-amber-100 via-white to-rose-50 p-6 ring-1 ring-zinc-200">
        <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
          Khu vực khách hàng
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
          Xin chào, {user.name ?? user.email}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Quản lý thông tin cá nhân, theo dõi đơn hàng và quay lại mua sắm
          nhanh hơn trong những lần tiếp theo.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-rose-50 text-[var(--brand-strong)]">
              <UserRound size={21} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-zinc-500">
                Hồ sơ
              </p>
              <h2 className="text-lg font-bold text-zinc-950">
                Thông tin cá nhân
              </h2>
            </div>
          </div>

          <AccountProfileForm
            user={{
              email: user.email,
              name: user.name,
              phone: user.phone,
              role: user.role,
            }}
            canViewRole={canViewRole}
          />
        </section>

        <aside className="space-y-3">
          <Link
            href="/account/orders"
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 font-semibold transition hover:border-zinc-300 hover:shadow-sm"
          >
            <ClipboardList size={20} className="text-[var(--brand-strong)]" />
            Đơn hàng của toi
          </Link>

          <Link
            href="/products"
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 font-semibold transition hover:border-zinc-300 hover:shadow-sm"
          >
            <ShoppingBag size={20} className="text-[var(--brand-strong)]" />
            Tiếp tục mua sắm
          </Link>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-3 font-semibold">
              <LogOut size={20} className="text-[var(--brand-strong)]" />
              Đăng xuất tài khoản
            </div>
            <LogoutButton />
          </div>
        </aside>
      </div>
    </main>
  );
}
