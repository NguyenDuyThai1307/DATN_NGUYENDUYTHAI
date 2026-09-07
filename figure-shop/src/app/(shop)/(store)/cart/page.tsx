import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getCartByUserId } from "@/services/cart.service";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";
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
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Giỏ hàng" },
        ]}
      />

      <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
            Giỏ hàng của bạn
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
            Kiểm tra sản phẩm
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Cập nhật số lượng, áp dụng coupon và kiểm tra tổng tiền trước khi
            chuyển sang thanh toán.
          </p>
        </div>

        <Link
          href="/products"
          className="text-sm font-semibold text-zinc-600 hover:text-[var(--brand-strong)]"
        >
          Tiếp tục mua sắm
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="lg:sticky lg:top-36 lg:h-fit">
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
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          title="Giỏ hàng đang trống"
          description="Hãy thêm một vài mô hình yêu thích vào giỏ hàng để bắt đầu đặt hàng."
          icon={<ShoppingBag size={22} aria-hidden="true" />}
          action={{ href: "/products", label: "Xem sản phẩm" }}
        />
      )}
    </main>
  );
}
