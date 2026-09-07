import Link from "next/link";
import { getAdminCategories } from "@/services/admin-category.service";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Danh mục</h1>
          <p className="mt-2 text-zinc-600">
            Quản lý các nhóm sản phẩm trong cửa hàng.
          </p>
        </div>

        <Link
            href="/admin/categories/create"
            className="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
            Thêm danh mục
        </Link>
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-zinc-200 bg-white">
        {categories.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {categories.map((category) => (
              <div
                key={category.id}
                className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_180px_160px]"
              >
                <div>
                  <p className="font-medium text-zinc-950">{category.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    /categories/{category.slug}
                  </p>
                  {category.description ? (
                    <p className="mt-2 text-sm text-zinc-600">
                      {category.description}
                    </p>
                  ) : null}
                </div>

                <div className="text-sm text-zinc-600">
                  {category._count.products} sản phẩm
                </div>

                <div className="flex items-start justify-end gap-2">
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
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
            <p className="text-zinc-600">Chưa có danh mục nào.</p>
          </div>
        )}
      </section>
    </main>
  );
}
