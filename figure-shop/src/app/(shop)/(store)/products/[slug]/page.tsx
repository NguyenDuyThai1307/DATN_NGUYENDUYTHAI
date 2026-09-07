import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { PreorderInfo } from "@/components/product/PreorderInfo";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
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
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm", href: "/products" },
          { label: product.name },
        ]}
      />

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.86fr)] lg:gap-12">
        <ProductGallery productName={product.name} images={product.images} />

        <section className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-36">
          <p className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase text-[var(--brand-strong)]">
            {product.type === "PREORDER" ? "Pre-order" : "Có sẵn"}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            {product.name}
          </h1>

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

          {product.description ? (
            <p className="mt-6 leading-7 text-zinc-700">{product.description}</p>
          ) : null}

          <PreorderInfo isPreorder={product.type === "PREORDER"} />
          {featuredCoupon ? (
            <PromoCodeBox code={featuredCoupon.code} name={featuredCoupon.name} />
          ) : null}
          <ProductPurchasePanel
            productId={product.id}
            stock={product.stock}
            isPreorder={product.type === "PREORDER"}
          />
          <ServiceCommitments />
        </section>
      </div>

      <ProductTabs description={product.description} />

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
