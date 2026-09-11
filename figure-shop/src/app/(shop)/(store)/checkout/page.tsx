import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { paymentMethods } from "@/lib/payment-config";
import { getCurrentUser } from "@/lib/auth";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
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
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Giỏ hàng", href: "/cart" },
          { label: "Thanh toán" },
        ]}
      />

      <div className="mt-6">
        <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
          Bước cuối cùng
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
          Thanh toán đơn hàng
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Điền thông tin giao hàng và chọn phương thức thanh toán phù hợp.
          Tổng tiền sẽ được tính từ giá sau khuyến mãi và coupon hiện tại.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase text-zinc-500">
              Địa chỉ nhận hàng
            </p>
            <h2 className="mt-1 text-lg font-bold text-zinc-950">
              Thông tin giao hàng
            </h2>
          </div>
          <CheckoutForm methods={paymentMethods()} />
        </section>

        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-36">
          <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
            Xác nhận
          </p>
          <h2 className="mt-1 text-lg font-bold text-zinc-950">
            Đơn hàng của bạn
          </h2>

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
                  <div className="min-w-0">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="mt-1 text-zinc-500">
                      Số lượng: {item.quantity}
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
            className="mt-5 inline-flex text-sm font-semibold text-zinc-600 hover:text-[var(--brand-strong)]"
          >
            Quay lại giỏ hàng
          </Link>
        </aside>
      </div>
    </main>
  );
}
