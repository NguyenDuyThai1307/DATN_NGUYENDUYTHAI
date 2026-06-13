import Link from "next/link";

const navItems = [
  { href: "/products", label: "San pham" },
  { href: "/preorder", label: "Pre-order" },
  { href: "/categories", label: "Danh muc" },
  { href: "/account", label: "Tai khoan" },
];

export function Header() {
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

        <Link
          href="/cart"
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Gio hang
        </Link>
      </div>
    </header>
  );
}