import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

const navItems = [
  { href: "/products", label: "San pham" },
  { href: "/preorder", label: "Pre-order" },
  { href: "/categories", label: "Danh muc" },
  { href: "/account", label: "Tai khoan" },
];

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Figure Shop
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-700 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-zinc-950">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Gio hang
          </Link>

          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium transition hover:bg-zinc-100"
            >
              Dang nhap
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}