import Link from "next/link";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { requireStaff } from "@/lib/permissions";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await requireStaff();

  return (
    <div className="min-h-screen bg-zinc-50 lg:flex">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-zinc-200 bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <p className="text-sm text-zinc-500">Dang dang nhap</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>

            <Link
              href="/"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-100"
            >
              Ve cua hang
            </Link>
          </div>
        </header>

        <div className="flex-1 px-6 py-8">{children}</div>
      </div>
    </div>
  );
}