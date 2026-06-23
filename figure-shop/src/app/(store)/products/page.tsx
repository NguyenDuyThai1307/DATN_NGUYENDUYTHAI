import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilter } from "@/components/product/ProductFilter";
import {
  getFilteredActiveProducts,
  getProductFilterOptions,
  type ActiveProductFilters,
  type ProductSort,
} from "@/services/product.service";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    brandId?: string;
    type?: string;
    sort?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const type =
  params.type === "IN_STOCK"
    ? "IN_STOCK"
    : params.type === "PREORDER"
      ? "PREORDER"
      : undefined;

  const sort: ProductSort =
    params.sort === "price_asc" || params.sort === "price_desc"
      ? params.sort
      : "newest";

    const filters: ActiveProductFilters = {
    query: params.q,
    categoryId: params.categoryId,
    brandId: params.brandId,
    type,
    sort,
};

  const [products, options] = await Promise.all([
    getFilteredActiveProducts(filters),
    getProductFilterOptions(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase text-red-600">
          Figure Shop
        </p>

        <h1 className="text-3xl font-bold tracking-tight">San pham</h1>

        <p className="max-w-2xl text-zinc-600">
          Tim kiem, loc va sap xep figure co san va san pham pre-order.
        </p>
      </div>

      <ProductFilter
        categories={options.categories}
        brands={options.brands}
        values={{
          query: params.q,
          categoryId: params.categoryId,
          brandId: params.brandId,
          type,
          sort,
        }}
      />

      <p className="mt-6 text-sm text-zinc-600">
        Tim thay {products.length} san pham.
      </p>

      {products.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-zinc-200 bg-white p-8 text-center">
          <p className="text-zinc-600">
            Khong tim thay san pham phu hop.
          </p>
        </div>
      )}
    </main>
  );
}