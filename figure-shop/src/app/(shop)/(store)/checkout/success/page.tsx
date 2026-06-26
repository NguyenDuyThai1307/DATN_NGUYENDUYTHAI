import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByIdForUser } from "@/services/order.service";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/account/orders");
  }

  const order = await getOrderByIdForUser(orderId, user.id);

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase text-emerald-600">
        Dat hang thanh cong
      </p>

      <h1 className="mt-2 text-3xl font-bold">Cam on ban da dat hang</h1>

      <p className="mt-3 text-zinc-600">
        Ma don hang cua ban la{" "}
        <span className="font-semibold text-zinc-950">{order.orderNumber}</span>.
      </p>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Phuong thuc thanh toan</span>
          <span className="font-medium">{order.paymentMethod}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
          <span className="font-semibold">Tong thanh toan</span>
          <ProductPrice price={order.total} />
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/account/orders/${order.id}`}
          className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
        >
          Xem chi tiet don hang
        </Link>

        <Link
          href="/products"
          className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-medium"
        >
          Tiep tuc mua sam
        </Link>
      </div>
    </main>
  );
}