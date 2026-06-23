import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getCartByUserId } from "@/services/cart.service";
import {
  calculateLinePricing,
  calculateOrderPricing,
} from "@/services/pricing.service";

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

  const pricing = calculateOrderPricing(
    items.map((item) => ({
      unitPrice: item.product.price,
      quantity: item.quantity,
      promotion: item.product.promotion,
    }))
  );

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
                <ProductPrice
                  price={
                    calculateLinePricing({
                      unitPrice: item.product.price,
                      quantity: item.quantity,
                    }).finalTotal
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-zinc-200 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600">Tam tinh</span>
              <ProductPrice price={pricing.subtotal} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-600">Giam gia</span>
              <span className="font-medium text-zinc-950">
                -{pricing.discountAmount.toLocaleString("vi-VN")} d
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-600">Phi giao hang</span>
              {pricing.shippingFee === 0 ? (
                <span className="font-medium text-emerald-700">Mien phi</span>
              ) : (
                <ProductPrice price={pricing.shippingFee} />
              )}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
              <span className="font-medium">Tong cong</span>
              <ProductPrice price={pricing.total} />
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