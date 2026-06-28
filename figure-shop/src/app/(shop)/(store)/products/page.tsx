import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import {
  ProductFilter,
  ProductFilterMobileDrawer,
} from "@/components/product/ProductFilter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductPagination } from "@/components/product/ProductPagination";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getPaginatedActiveProducts,
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
    params.sort === "price_asc" ||
    params.sort === "price_desc" ||
    params.sort === "name_asc" ||
    params.sort === "name_desc" ||
    params.sort === "oldest"
      ? params.sort
      : "newest";
  const minPrice = parsePriceParam(params.minPrice);
  const maxPrice = parsePriceParam(params.maxPrice);

  const filters: ActiveProductFilters = {
    query: params.q,
    categoryId: params.categoryId,
    brandId: params.brandId,
    type,
    sort,
    minPrice,
    maxPrice,
  };

  const [result, options] = await Promise.all([
    getPaginatedActiveProducts(filters, Number(params.page) || 1),
    getProductFilterOptions(),
  ]);

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[{ label: "Trang chu", href: "/" }, { label: "San pham" }]}
      />
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase text-red-600">
          Figure Shop
        </p>

        <h1 className="text-3xl font-bold tracking-tight">San pham</h1>

        <p className="max-w-2xl text-zinc-600">
          Tim kiem, loc va sap xep figure co san va san pham pre-order.
        </p>
      </div>

      <div className="mt-8">
        <ProductFilterMobileDrawer
          categories={options.categories}
          brands={options.brands}
          values={{
            query: params.q,
            categoryId: params.categoryId,
            brandId: params.brandId,
            type,
            sort,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
          }}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(250px,25%)_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-36">
            <div className="mb-3">
              <p className="text-sm font-bold text-zinc-950">Bo loc san pham</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Chon thuong hieu, danh muc, gia va tinh trang hang.
              </p>
            </div>
            <ProductFilter
              layout="sidebar"
              categories={options.categories}
              brands={options.brands}
              values={{
                query: params.q,
                categoryId: params.categoryId,
                brandId: params.brandId,
                type,
                sort,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
              }}
            />
          </div>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-600">
              Tim thay {result.total} san pham.
            </p>
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Sap xep: {sort.replace("_", " ")}
            </p>
          </div>

          {result.products.length > 0 ? (
            <>
              <ProductGrid products={result.products} />
              <ProductPagination
                pathname="/products"
                currentPage={result.currentPage}
                pageCount={result.pageCount}
                searchParams={params}
              />
            </>
          ) : (
            <EmptyState
              title="Khong tim thay san pham"
              description="Thu doi tu khoa, bo bot bo loc hoac quay lai danh sach san pham de xem tat ca figure hien co."
              action={{ href: "/products", label: "Xem tat ca san pham" }}
            />
          )}
        </section>
      </div>
    </main>
  );
}
