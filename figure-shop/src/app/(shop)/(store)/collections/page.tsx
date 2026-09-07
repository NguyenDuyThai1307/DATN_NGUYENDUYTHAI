import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { getActiveProducts, getProductFilterOptions } from "@/services/product.service";

export default async function CollectionsPage() {
  const [products, options] = await Promise.all([
    getActiveProducts(),
    getProductFilterOptions(),
  ]);

  const categories = options.categories.map((category) => {
    const categoryProducts = products.filter(
      (product) => product.category?.id === category.id,
    );

    return {
      ...category,
      productCount: categoryProducts.length,
      imageUrl: categoryProducts[0]?.images[0]?.url,
    };
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[{ label: "Trang chủ", href: "/" }, { label: "Danh mục" }]}
      />

      <div className="mt-5">
        <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
          Bộ sưu tập
        </p>
        <h1 className="mt-2 text-3xl font-black text-zinc-950">
          Danh mục sản phẩm
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Chọn nhanh nhóm mô hình theo dòng sản phẩm để lọc bộ sưu tập phù hợp.
        </p>
      </div>

      {categories.length > 0 ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections/${category.slug}`}
              className="group overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-zinc-100">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-zinc-500">
                    Chưa có ảnh danh mục
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-bold text-zinc-950 transition group-hover:text-[var(--brand-strong)]">
                  {category.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {category.productCount} sản phẩm
                </p>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
          Chưa có danh mục sản phẩm.
        </div>
      )}
    </main>
  );
}
