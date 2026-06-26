import Link from "next/link";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ArchiveProductButton } from "@/components/admin/ArchiveProductButton";
import Image from "next/image";
import { AdminProductFilter } from "@/components/admin/AdminProductFilter";
import {
  getAdminProductFilterOptions,
  getAdminProducts,
  type AdminProductFilters,
} from "@/services/admin-product.service";

type AdminProductsPageProps = {
  searchParams: Promise<{
    query?: string;
    categoryId?: string;
    brandId?: string;
    status?: string;
    type?: string;
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;

  const status =
    params.status === "ACTIVE" ||
    params.status === "DRAFT" ||
    params.status === "ARCHIVED"
      ? params.status
      : undefined;

  const type =
    params.type === "IN_STOCK" || params.type === "PREORDER"
      ? params.type
      : undefined;

  const filters: AdminProductFilters = {
    query: params.query,
    categoryId: params.categoryId,
    brandId: params.brandId,
    status,
    type,
  };

  const [products, options] = await Promise.all([
    getAdminProducts(filters),
    getAdminProductFilterOptions(),
  ]);

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
      <AdminProductFilter
        categories={options.categories}
        brands={options.brands}
        values={filters}
      />

      <section className="mt-6 overflow-hidden rounded-md border border-zinc-200 bg-white">
        {products.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid gap-4 px-5 py-4 sm:grid-cols-[72px_1.4fr_1fr_1fr_1fr]"
              >
                <div className="relative aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt ?? product.name}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-zinc-500">
                      No image
                    </div>
                  )}
                </div>
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