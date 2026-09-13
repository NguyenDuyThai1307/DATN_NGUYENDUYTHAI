import Link from "next/link";
import { Plus, PackageSearch } from "lucide-react";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ArchiveProductButton } from "@/components/admin/ArchiveProductButton";
import { ProductAvailabilityEditor } from "@/components/admin/ProductAvailabilityEditor";
import Image from "next/image";
import { AdminProductFilter } from "@/components/admin/AdminProductFilter";
import { EmptyState } from "@/components/ui/EmptyState";
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
          <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
            Kho hàng
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
            Sản phẩm
          </h1>
          <p className="mt-2 text-zinc-600">
            Quản lý sản phẩm có sẵn và pre-order.
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          <Plus size={16} aria-hidden="true" />
          Thêm sản phẩm
        </Link>
      </div>
      <AdminProductFilter
        categories={options.categories}
        brands={options.brands}
        values={filters}
      />

      <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {products.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid gap-4 px-5 py-4 transition hover:bg-amber-50/50 sm:grid-cols-[72px_1.4fr_1fr_1fr_1fr]"
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
                      Chưa có ảnh
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-zinc-950">{product.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {product.slug}
                  </p>
                </div>

                <div className="text-sm text-zinc-600">
                  <p>{product.brand?.name ?? "Chưa có brand"}</p>
                  <p>
                    {product.categories.length > 0
                      ? product.categories
                          .map((item) => item.category.name)
                          .join(", ")
                      : product.category?.name ?? "Chưa có danh mục"}
                  </p>
                </div>

                <div className="text-sm text-zinc-600">
                  <p>{product.status}</p>
                  <p>{product.type === "PREORDER" ? "Pre-order — Đặt trước" : "In-stock — Có sẵn"}</p>
                  <ProductAvailabilityEditor productId={product.id} name={product.name} type={product.type} stock={product.stock} />
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <div className="lg:text-right">
                    <ProductPrice price={product.price} />
                    <p className="mt-1 text-sm text-zinc-500">
                      Tồn kho: {product.stock}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
                    >
                      Sửa
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
          <EmptyState
            className="m-5"
            title="Chưa có sản phẩm nào"
            description="Tạo sản phẩm đầu tiên để hiển thị trên trang cửa hàng."
            icon={<PackageSearch size={22} aria-hidden="true" />}
            action={{ href: "/admin/products/create", label: "Thêm sản phẩm" }}
          />
        )}
      </section>
    </main>
  );
}
