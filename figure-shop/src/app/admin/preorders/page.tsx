import Link from "next/link";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getActivePreorderProducts } from "@/services/preorder.service";

export default async function AdminPreordersPage() {
  const products = await getActivePreorderProducts();

  return (
    <main>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pre-orders</h1>
          <p className="mt-2 text-zinc-600">
            Theo doi cac san pham dang nhan dat truoc.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-100"
        >
          Quan ly san pham
        </Link>
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-zinc-200 bg-white">
        {products.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="grid gap-4 px-5 py-4 transition hover:bg-zinc-50 lg:grid-cols-[1.4fr_1fr_1fr]"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">{product.slug}</p>
                </div>

                <div className="text-sm text-zinc-600">
                  <p>{product.brand?.name ?? "Chua co brand"}</p>
                  <p>{product.category?.name ?? "Chua co danh muc"}</p>
                </div>

                <div className="lg:text-right">
                  <ProductPrice price={product.price} />
                  <p className="mt-1 text-sm text-zinc-500">
                    Trang thai: {product.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-zinc-600">
            Chua co san pham pre-order.
          </div>
        )}
      </section>
    </main>
  );
}