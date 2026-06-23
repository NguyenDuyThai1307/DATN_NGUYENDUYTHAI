import Link from "next/link";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getAdminProducts } from "@/services/admin-product.service";
import { ArchiveProductButton } from "@/components/admin/ArchiveProductButton";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <main>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">San pham</h1>
          <p className="mt-2 text-zinc-600">
            Quan ly san pham co san va pre-order.
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Them san pham
        </Link>
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-zinc-200 bg-white">
        {products.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid gap-4 px-5 py-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {product.slug}
                  </p>
                </div>

                <div className="text-sm text-zinc-600">
                  <p>{product.brand?.name ?? "Chua co brand"}</p>
                  <p>{product.category?.name ?? "Chua co danh muc"}</p>
                </div>

                <div className="text-sm text-zinc-600">
                  <p>{product.status}</p>
                  <p>{product.type}</p>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <div className="lg:text-right">
                    <ProductPrice price={product.price} />
                    <p className="mt-1 text-sm text-zinc-500">
                      Ton kho: {product.stock}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
                    >
                      Sua
                    </Link>

                    {product.status !== "ARCHIVED" ? (
                      <ArchiveProductButton productId={product.id} />
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-zinc-600">
            Chua co san pham nao.
          </div>
        )}
      </section>
    </main>
  );
}