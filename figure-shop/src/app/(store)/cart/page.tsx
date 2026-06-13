import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getCartByUserId } from "@/services/cart.service";

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/cart");
  }

  const cart = await getCartByUserId(user.id);
  const items = cart?.items ?? [];

  const subtotal = items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Gio hang</h1>

      {items.length > 0 ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 rounded-md border border-zinc-200 bg-white p-4 sm:grid-cols-[120px_1fr]"
              >
                <div className="flex aspect-square items-center justify-center rounded bg-zinc-100 px-4 text-center text-xs font-medium text-zinc-500">
                  {item.product.images[0]?.alt ?? item.product.name}
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <div>
                    {item.product.brand ? (
                      <p className="text-xs font-medium uppercase text-zinc-500">
                        {item.product.brand.name}
                      </p>
                    ) : null}

                    <Link
                      href={`/products/${item.product.slug}`}
                      className="mt-1 block font-semibold hover:text-red-600"
                    >
                      {item.product.name}
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-zinc-600">
                      So luong: {item.quantity}
                    </div>
                    <ProductPrice price={item.product.price * item.quantity} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-md border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold">Tom tat don hang</h2>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-zinc-600">Tam tinh</span>
              <ProductPrice price={subtotal} />
            </div>

            <Link
              href="/checkout"
              className="mt-5 block rounded-md bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Thanh toan
            </Link>
          </aside>
        </div>
      ) : (
        <div className="mt-8 rounded-md border border-zinc-200 bg-white p-8 text-center">
          <p className="text-zinc-600">Gio hang dang trong.</p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Xem san pham
          </Link>
        </div>
      )}
    </main>
  );
}