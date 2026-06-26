import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Tai khoan</h1>
      <p className="mt-2 text-zinc-600">
        Quan ly thong tin ca nhan, don hang va dia chi giao hang.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-md border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">Thong tin ca nhan</h2>

          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>Email: {user.email}</p>
            <p>Ho ten: {user.name ?? "Chua cap nhat"}</p>
            <p>So dien thoai: {user.phone ?? "Chua cap nhat"}</p>
            <p>Vai tro: {user.role}</p>
          </div>
        </section>

        <aside className="space-y-3">
          <Link
            href="/account/orders"
            className="block rounded-md border border-zinc-200 bg-white p-4 font-medium transition hover:border-zinc-300 hover:shadow-sm"
          >
            Don hang cua toi
          </Link>

          <Link
            href="/products"
            className="block rounded-md border border-zinc-200 bg-white p-4 font-medium transition hover:border-zinc-300 hover:shadow-sm"
          >
            Tiep tuc mua sam
          </Link>
        </aside>
      </div>
    </main>
  );
}