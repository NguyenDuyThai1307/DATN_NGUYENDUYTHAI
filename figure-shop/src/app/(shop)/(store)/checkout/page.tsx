import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCurrentUser } from "@/lib/auth";
import { ProductPrice } from "@/components/product/ProductPrice";
import { OrderSummary } from "@/components/order/OrderSummary";
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
    })),
    0,
    cart?.coupon,
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
            {items.map((item) => {
              const linePricing = calculateLinePricing({
                unitPrice: item.product.price,
                quantity: item.quantity,
                promotion: item.product.promotion,
              });

              return (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="mt-1 text-zinc-500">
                      So luong: {item.quantity}
                    </p>
                  </div>

                  <ProductPrice
                    price={linePricing.finalTotal}
                    originalPrice={
                      linePricing.originalTotal > linePricing.finalTotal
                        ? linePricing.originalTotal
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>

          <OrderSummary
            subtotal={pricing.subtotal}
            productDiscountAmount={pricing.productDiscountAmount}
            couponDiscountAmount={pricing.couponDiscountAmount}
            couponCode={cart?.coupon?.code}
            shippingFee={pricing.shippingFee}
            total={pricing.total}
          />

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