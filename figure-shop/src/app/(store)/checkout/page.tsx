import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getCartByUserId } from "@/services/cart.service";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const cart = await getCartByUserId(user.id);
  const items = cart?.items ?? [];

  if (items.length === 0) {
    redirect("/cart");
  }

  const subtotal = items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Thanh toan</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-md border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">Thong tin giao hang</h2>

            <CheckoutForm />
        </section>

        <aside className="h-fit rounded-md border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">Don hang cua ban</h2>

          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="mt-1 text-zinc-500">So luong: {item.quantity}</p>
                </div>
                <ProductPrice price={item.product.price * item.quantity} />
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-zinc-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Tong cong</span>
              <ProductPrice price={subtotal} />
            </div>
          </div>

          <Link
            href="/cart"
            className="mt-4 inline-flex text-sm font-medium text-zinc-600 hover:text-zinc-950"
          >
            Quay lai gio hang
          </Link>
        </aside>
      </div>
    </main>
  );
}