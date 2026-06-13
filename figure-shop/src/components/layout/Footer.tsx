import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">Figure Shop</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Cua hang mo hinh suu tam, ho tro san pham co san va pre-order.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Cua hang</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-600">
            <Link href="/products" className="hover:text-zinc-950">
              San pham
            </Link>
            <Link href="/preorder" className="hover:text-zinc-950">
              Pre-order
            </Link>
            <Link href="/cart" className="hover:text-zinc-950">
              Gio hang
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Tai khoan</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-600">
            <Link href="/login" className="hover:text-zinc-950">
              Dang nhap
            </Link>
            <Link href="/register" className="hover:text-zinc-950">
              Dang ky
            </Link>
            <Link href="/account" className="hover:text-zinc-950">
              Tai khoan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}