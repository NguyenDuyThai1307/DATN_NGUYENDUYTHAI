import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { getActiveProducts, getProductFilterOptions } from "@/services/product.service";

export default async function BrandsPage() {
  const [products, options] = await Promise.all([
    getActiveProducts(),
    getProductFilterOptions(),
  ]);

  const brands = options.brands.map((brand) => {
    const brandProducts = products.filter(
      (product) => product.brand?.id === brand.id,
    );

    return {
      ...brand,
      productCount: brandProducts.length,
      imageUrl: brandProducts[0]?.images[0]?.url,
    };
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[{ label: "Trang chủ", href: "/" }, { label: "Thương hiệu" }]}
      />

      <div className="mt-5">
        <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
          Hãng sản xuất
        </p>
        <h1 className="mt-2 text-3xl font-black text-zinc-950">
          Thương hiệu mô hình
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Lọc nhanh sản phẩm theo thương hiệu, nhà sản xuất hoặc series đang có
          trong cửa hàng.
        </p>
      </div>

      {brands.length > 0 ? (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brandId=${brand.id}`}
              className="group flex min-h-40 items-center gap-4 rounded-lg border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:shadow-md"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-white">
                {brand.imageUrl ? (
                  <Image
                    src={brand.imageUrl}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-lg font-black text-[var(--brand-strong)]">
                    {brand.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-bold text-zinc-950 transition group-hover:text-[var(--brand-strong)]">
                  {brand.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {brand.productCount} sản phẩm
                </p>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
          Chưa có thương hiệu sản phẩm.
        </div>
      )}
    </main>
  );
}
