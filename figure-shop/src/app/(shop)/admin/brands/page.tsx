import Link from "next/link";
import { getAdminBrands } from "@/services/admin-brand.service";

export default async function AdminBrandsPage() {
  const brands = await getAdminBrands();

  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Thương hiệu
          </h1>
          <p className="mt-2 text-zinc-600">
            Quản lý thương hiệu, hãng sản xuất hoặc series sản phẩm.
          </p>
        </div>

        <Link
          href="/admin/brands/create"
          className="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Thêm thương hiệu
        </Link>
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-zinc-200 bg-white">
        {brands.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_180px_160px]"
              >
                <div>
                  <p className="font-medium text-zinc-950">{brand.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    /brands/{brand.slug}
                  </p>
                  {brand.description ? (
                    <p className="mt-2 text-sm text-zinc-600">
                      {brand.description}
                    </p>
                  ) : null}
                </div>

                <div className="text-sm text-zinc-600">
                  {brand._count.products} sản phẩm
                </div>

                <div className="flex items-start justify-end gap-2">
                  <Link
                    href={`/admin/brands/${brand.id}/edit`}
                    className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
                  >
                    Sửa
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-zinc-600">Chưa có thương hiệu nào.</p>
          </div>
        )}
      </section>
    </main>
  );
}
