import { HomeHero } from "@/components/home/HomeHero";
import { BadgePercent } from "lucide-react";
import { RevealSection } from "@/components/home/RevealSection";
import { HomeSection } from "@/components/home/HomeSection";
import {
  BrandLogoCloud,
  FeaturedCategoryGrid,
  LatestNewsSection,
  ServiceBanners,
  VideoReviewSection,
} from "@/components/home/HomeContentBlocks";
import { ProductShelf } from "@/components/home/ProductShelf";
import { isPromotionActive } from "@/services/pricing.service";
import {
  getActiveProducts,
  getProductFilterOptions,
} from "@/services/product.service";

export default function HomePage() {
  return <HomePageContent />;
}

async function HomePageContent() {
  const [products, options] = await Promise.all([
    getActiveProducts(),
    getProductFilterOptions(),
  ]);

  const productsWithImages = products.filter(
    (product) => Boolean(product.images[0]?.url?.trim()),
  );
  const discountedProducts = productsWithImages.filter(
    (product) => product.type === "IN_STOCK" && product.promotion && isPromotionActive(product.promotion),
  );
  const releasedProducts = productsWithImages.filter((product) => product.type === "IN_STOCK");
  const preorderProducts = productsWithImages.filter((product) => product.type === "PREORDER");
  const catalogCategories = options.categories.slice(0, 8).map((category) => {
    const firstProduct = productsWithImages.find((product) => product.category?.id === category.id);

    return {
      ...category,
      productCount: products.filter((product) => product.category?.id === category.id).length,
      imageUrl: firstProduct?.images[0]?.url,
    };
  });

  return (
    <main className="bg-[var(--background)]">
      <div className="mx-auto max-w-[1500px] px-4 pb-12 sm:px-6">
        <div className="pt-4 sm:pt-6">
          <HomeHero />
        </div>

        <div>
          {discountedProducts.length > 0 ? (
            <RevealSection className="sale-section mt-6 rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-100 via-rose-50 to-white p-4 shadow-sm sm:mt-8 sm:p-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand-strong)] text-white shadow-sm sm:size-14">
                    <BadgePercent size={28} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--brand-strong)]">Ưu đãi đang diễn ra</p>
                    <h2 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">Sản phẩm giảm giá</h2>
                  </div>
                </div>
                <span className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-[var(--brand-strong)]">
                  {discountedProducts.length} sản phẩm đang ưu đãi
                </span>
              </div>
              <p className="mb-5 text-sm leading-6 text-zinc-600">Giá ưu đãi, giá gốc và số tiền tiết kiệm được hiển thị trên từng sản phẩm.</p>
              <ProductShelf products={discountedProducts} />
            </RevealSection>
          ) : null}

          <HomeSection title="Danh mục nổi bật" href="/collections">
            {catalogCategories.length > 0 ? <FeaturedCategoryGrid categories={catalogCategories} /> : <p className="text-sm text-zinc-500">Chưa có danh mục được tạo.</p>}
          </HomeSection>

          <HomeSection title="Mô hình đã phát hành" eyebrow="Sẵn sàng cho bộ sưu tập" href="/products?type=IN_STOCK">
            <ProductShelf products={releasedProducts.slice(0, 8)} />
          </HomeSection>

          <HomeSection title="Mô hình đặt trước" eyebrow="Phiên bản sắp ra mắt" href="/preorder">
            <ProductShelf products={preorderProducts.slice(0, 8)} />
          </HomeSection>

          <ServiceBanners />

          <HomeSection title="Góc sưu tầm" eyebrow="Tìm cảm hứng cho bộ sưu tập">
            <VideoReviewSection />
          </HomeSection>

          <HomeSection title="Tin tức mới nhất" href="/news">
            <LatestNewsSection />
          </HomeSection>

          <HomeSection title="Thương hiệu được yêu thích">
            <BrandLogoCloud brands={options.brands} />
          </HomeSection>
        </div>
      </div>
    </main>
  );
}
