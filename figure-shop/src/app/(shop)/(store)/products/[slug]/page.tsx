import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProductReviews } from "@/services/review.service";
import { ProductReviews } from "@/components/product/ProductReviews";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { PreorderInfo } from "@/components/product/PreorderInfo";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { WishlistButton } from "@/components/product/Wishlist";
import { ProductTabs } from "@/components/product/ProductTabs";
import { PromoCodeBox } from "@/components/product/PromoCodeBox";
import { ServiceCommitments } from "@/components/product/ServiceCommitments";
import { getFeaturedCoupon } from "@/services/coupon.service";
import {
  getActiveProducts,
  getProductBySlug,
} from "@/services/product.service";
import {
  calculateLinePricing,
  isPromotionActive,
} from "@/services/pricing.service";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const [product, featuredCoupon, activeProducts] = await Promise.all([
    getProductBySlug(slug),
    getFeaturedCoupon(),
    getActiveProducts(),
  ]);

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const user = await getCurrentUser();
  const reviews = await getProductReviews(product.id, user?.id ?? null);
  const activePromotion =
    product.promotion && isPromotionActive(product.promotion)
      ? product.promotion
      : null;
  const pricing = calculateLinePricing({
    unitPrice: product.price,
    quantity: 1,
    promotion: activePromotion,
  });
  const relatedProducts = activeProducts
    .filter((item) => item.id !== product.id)
    .filter(
      (item) =>
        item.categoryId === product.categoryId || item.brandId === product.brandId,
    )
    .slice(0, 5);

  return (
    <main className="mx-auto max-w-[1560px] px-4 py-6 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm", href: "/products" },
          { label: product.name },
        ]}
      />

      <div className="product-detail-grid mt-6">
        <ProductGallery productName={product.name} images={product.images} />

        <section className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-36">
          <p className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase text-[var(--brand-strong)]">
            {product.type === "PREORDER" ? "Pre-order" : product.stock > 0 ? "Có sẵn" : "Hết hàng"}
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
            {product.name}
          </h1>
          <a href="#reviews" className="mt-2 inline-block text-sm text-amber-700 hover:underline">{reviews.total ? `★ ${reviews.average.toFixed(1)}/5 · ${reviews.total} đánh giá` : "Chưa có đánh giá · Viết đánh giá"}</a>
          <div className="mt-3 flex items-center gap-2"><WishlistButton productId={product.id} name={product.name} /><span className="text-sm text-zinc-500">Lưu vào danh sách yêu thích</span></div>

          <div className="mt-5">
            <ProductPrice
              price={pricing.finalUnitPrice}
              originalPrice={activePromotion ? product.price : undefined}
            />
            {activePromotion ? (
              <p className="mt-2 text-sm font-bold text-[var(--brand-strong)]">
                {activePromotion.type === "PERCENTAGE"
                  ? `Khuyến mãi giảm ${activePromotion.value}%`
                  : `Khuyến mãi giảm ${activePromotion.value.toLocaleString("vi-VN")} đ`}
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
            {product.name.match(/\b1\/\d+\b/) ? <div className="flex justify-between gap-4"><span>Tỷ lệ theo tên sản phẩm</span><span className="font-semibold text-zinc-900">{product.name.match(/\b1\/\d+\b/)?.[0]}</span></div> : null}
            {product.brand ? (
              <div className="flex items-center justify-between gap-4">
                <span>Thương hiệu</span>
                <span className="font-semibold text-zinc-900">
                  {product.brand.name}
                </span>
              </div>
            ) : null}
            {product.category ? (
              <div className="flex items-center justify-between gap-4">
                <span>Danh mục</span>
                <span className="font-semibold text-zinc-900">
                  {product.category.name}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <span>Tình trạng</span>
              <span className="font-semibold text-zinc-900">
                {product.type === "PREORDER"
                  ? "Đang nhận đặt trước"
                  : `Còn ${product.stock} sản phẩm`}
              </span>
            </div>
          </div>


          <ProductPurchasePanel
            productId={product.id}
            stock={product.stock}
            isPreorder={product.type === "PREORDER"}
          />

          {product.description ? (
            <p className="mt-6 leading-7 text-zinc-700">{product.description}</p>
          ) : null}

          <PreorderInfo isPreorder={product.type === "PREORDER"} />
          {featuredCoupon ? (
            <PromoCodeBox code={featuredCoupon.code} name={featuredCoupon.name} />
          ) : null}
          <ServiceCommitments />
        </section>
        <aside className="product-specs overflow-hidden rounded-lg border border-zinc-200 bg-white"><h2 className="border-b border-zinc-200 bg-blue-50 p-4 text-base font-bold text-blue-600">Thông tin sản phẩm</h2><dl className="divide-y divide-zinc-100 px-4 text-xs">{[["Thương hiệu", product.brand?.name ?? "Đang cập nhật"], ["Danh mục", product.category?.name ?? "Đang cập nhật"], ["Loại hàng", product.type === "PREORDER" ? "Đặt trước" : "Có sẵn"], ["Tỷ lệ", product.name.match(/\b1\/\d+\b/)?.[0] ?? "Đang cập nhật"], ["Chiều cao", "Đang cập nhật"], ["Chất liệu", "Đang cập nhật"], ["Phụ kiện", "Liên hệ để xác nhận"]].map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-3 py-3"><dt className="text-zinc-500">{label}</dt><dd>{value}</dd></div>)}</dl></aside>
      </div>

      <ProductTabs description={product.description} />
      <ProductReviews key={`${product.id}:${user?.id ?? "guest"}`} productId={product.id} slug={product.slug} initial={reviews} />

      {relatedProducts.length > 0 ? (
        <section className="mt-12">
          <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
            Có thể bạn sẽ thích
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-950">
            Sản phẩm liên quan
          </h2>
          <div className="mt-5">
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
