import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import { HomeHero } from "@/components/home/HomeHero";
import { ActiveFilters } from "@/components/product/ActiveFilters";
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
  preorder?: boolean;
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
  preorder = false,
}: ProductsPageProps) {
  const suppliedParams = await searchParams;
  const params = preorder ? { ...suppliedParams, type: undefined } : suppliedParams;
  const pathname = preorder ? "/preorder" : "/products";

  const type =
    preorder ? "PREORDER" : params.type === "IN_STOCK"
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
        items={[{ label: "Trang chủ", href: "/" }, { label: preorder ? "Pre-order" : "Sản phẩm" }]}
      />
      {preorder && <div className="mt-4"><HomeHero compact /></div>}
      <div className="catalog-heading"><div className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase text-red-600">
          Figure Shop
        </p>

        <h1 className="text-3xl font-bold tracking-tight">{preorder ? "Sản phẩm Pre-order" : "Danh mục sản phẩm"}</h1>

        <p className="max-w-2xl text-zinc-600">
          Tìm kiếm, lọc và sắp xếp mô hình có sẵn và sản phẩm đặt trước.
        </p>
      </div>{!preorder && <div className="catalog-heading-art"><Image src="/images/home/figure-shop-hero-hd.png" alt="" fill sizes="600px" className="object-cover object-center" /><p className="relative z-10 px-6 py-7 text-xl font-bold italic">Sưu tầm đam mê<br />Kết nối cộng đồng</p></div>}</div>

      <div className="mt-8">
        <ProductFilterMobileDrawer
          action={pathname}
          fixedType={preorder ? "PREORDER" : undefined}
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

      <div className="catalog-layout mt-5">
        <aside className="hidden lg:block">
          <div className="sticky top-36">
            <div className="mb-3">
              <p className="text-sm font-bold text-zinc-950">Bộ lọc sản phẩm</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Chọn thương hiệu, danh mục, giá và tình trạng hàng.
              </p>
            </div>
            <ProductFilter
              action={pathname}
              fixedType={preorder ? "PREORDER" : undefined}
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
          <nav aria-label="Danh mục nhanh" className="mb-5 flex gap-2 overflow-x-auto pb-1"><Link href={pathname} className="shrink-0 rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-xs font-semibold text-white">Tất cả</Link>{options.categories.map(category => <Link key={category.id} href={`${pathname}?categoryId=${category.id}`} className={`shrink-0 rounded-md border px-3 py-2 text-xs ${params.categoryId === category.id ? "border-blue-600 bg-blue-50 text-blue-600" : "border-zinc-200"}`}>{category.name}</Link>)}</nav>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-600">
              Tìm thấy {result.total} sản phẩm.
            </p>
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Sắp xếp: {{newest: "Mới nhất", oldest: "Cũ nhất", name_asc: "Tên A–Z", name_desc: "Tên Z–A", price_asc: "Giá thấp đến cao", price_desc: "Giá cao đến thấp"}[sort]}
            </p>
          </div>

          <ActiveFilters pathname={pathname} params={params} categories={options.categories} brands={options.brands} />
          {result.products.length > 0 ? (
            <>
              <ProductGrid products={result.products} />
              <ProductPagination
                pathname={pathname}
                currentPage={result.currentPage}
                pageCount={result.pageCount}
                searchParams={params}
              />
            </>
          ) : (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              description="Thử đổi từ khóa, bỏ bớt bộ lọc hoặc quay lại danh sách sản phẩm để xem tất cả mô hình hiện có."
              action={{ href: pathname, label: preorder ? "Xem tất cả pre-order" : "Xem tất cả sản phẩm" }}
            />
          )}
        </section>
      </div>
    </main>
  );
}
