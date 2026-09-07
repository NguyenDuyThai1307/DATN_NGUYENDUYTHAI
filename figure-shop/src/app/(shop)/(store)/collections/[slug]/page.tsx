import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import {
  ProductFilter,
  ProductFilterMobileDrawer,
} from "@/components/product/ProductFilter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductPagination } from "@/components/product/ProductPagination";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getCategoryBySlug,
  getPaginatedActiveProducts,
  getProductFilterOptions,
  type ActiveProductFilters,
  type ProductSort,
} from "@/services/product.service";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    brandId?: string;
    type?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
};

function parsePriceParam(value?: string) {
  if (!value) {
    return undefined;
  }

  const price = Number(value);

  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const type =
    query.type === "IN_STOCK" || query.type === "PREORDER"
      ? query.type
      : undefined;
  const validSorts: ProductSort[] = [
    "newest",
    "oldest",
    "name_asc",
    "name_desc",
    "price_asc",
    "price_desc",
  ];
  const sort = validSorts.includes(query.sort as ProductSort)
    ? (query.sort as ProductSort)
    : "newest";
  const minPrice = parsePriceParam(query.minPrice);
  const maxPrice = parsePriceParam(query.maxPrice);
  const filters: ActiveProductFilters = {
    query: query.q,
    brandId: query.brandId,
    type,
    sort,
    categoryId: category.id,
    minPrice,
    maxPrice,
  };
  const [result, options] = await Promise.all([
    getPaginatedActiveProducts(filters, Number(query.page) || 1),
    getProductFilterOptions(),
  ]);
  const pathname = `/collections/${category.slug}`;

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Danh mục", href: "/products" },
          { label: category.name },
        ]}
      />

      <div className="mt-5">
        <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
          Danh mục mô hình
        </p>
        <h1 className="mt-2 text-3xl font-black text-zinc-950">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl text-zinc-600">
            {category.description}
          </p>
        ) : null}
      </div>

      <div className="mt-8">
        <ProductFilterMobileDrawer
          action={pathname}
          resetHref={pathname}
          showCategory={false}
          categories={options.categories}
          brands={options.brands}
          values={{
            query: query.q,
            categoryId: category.id,
            brandId: query.brandId,
            type,
            sort,
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
          }}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(250px,25%)_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-36">
            <p className="mb-3 text-sm font-bold text-zinc-950">Lọc sản phẩm</p>
            <ProductFilter
            action={pathname}
            layout="sidebar"
            resetHref={pathname}
            showCategory={false}
            categories={options.categories}
            brands={options.brands}
            values={{
              query: query.q,
              categoryId: category.id,
              brandId: query.brandId,
              type,
              sort,
              minPrice: query.minPrice,
              maxPrice: query.maxPrice,
            }}
          />
          </div>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-zinc-600">{result.total} sản phẩm</p>
            <p className="text-sm font-medium text-zinc-700">
              Sắp xếp: {sort.replace("_", " ")}
            </p>
          </div>

          {result.products.length > 0 ? (
            <ProductGrid products={result.products} />
          ) : (
            <EmptyState
              title="Chưa có sản phẩm phù hợp"
              description="Bộ lọc hiện tại không có kết quả trong danh mục này. Thử đổi khoảng giá, thương hiệu hoặc tình trạng hàng."
              action={{ href: pathname, label: "Đặt lại bộ lọc" }}
            />
          )}

          <ProductPagination
            pathname={pathname}
            currentPage={result.currentPage}
            pageCount={result.pageCount}
            searchParams={query}
          />
        </section>
      </div>
    </main>
  );
}
