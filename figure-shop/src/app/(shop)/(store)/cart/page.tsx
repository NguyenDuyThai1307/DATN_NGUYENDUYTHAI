import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCartByUserId } from "@/services/cart.service";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { calculateOrderPricing } from "@/services/pricing.service";

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/cart");
  }

  const cart = await getCartByUserId(user.id);
  const items = cart?.items ?? [];

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
      <h1 className="text-3xl font-bold tracking-tight">Gio hang</h1>

      {items.length > 0 ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <CartSummary
          subtotal={pricing.subtotal}
          productDiscountAmount={pricing.productDiscountAmount}
          couponDiscountAmount={pricing.couponDiscountAmount}
          discountAmount={pricing.discountAmount}
          shippingFee={pricing.shippingFee}
          total={pricing.total}
          coupon={cart?.coupon}
        />
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