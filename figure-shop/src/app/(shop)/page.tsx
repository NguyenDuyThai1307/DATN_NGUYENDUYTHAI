import { Flame } from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSection } from "@/components/home/HomeSection";
import {
  BrandLogoCloud,
  FeaturedCategoryGrid,
  FeaturedSeries,
  LatestNewsSection,
  NewsHighlight,
  PromoShortcutGrid,
  ServiceBanners,
  VideoReviewSection,
} from "@/components/home/HomeContentBlocks";
import { FlashSaleCountdown } from "@/components/home/FlashSaleCountdown";
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

  const discountedProducts = products.filter(
    (product) => product.promotion && isPromotionActive(product.promotion),
  );
  const releasedProducts = products.filter((product) => product.type === "IN_STOCK");
  const preorderProducts = products.filter((product) => product.type === "PREORDER");
  const catalogCategories = options.categories.slice(0, 8).map((category) => {
    const firstProduct = products.find((product) => product.category?.id === category.id);

    return {
      ...category,
      productCount: products.filter((product) => product.category?.id === category.id).length,
      imageUrl: firstProduct?.images[0]?.url,
    };
  });

  return (
    <main className="bg-[var(--background)]">
      <div className="mx-auto max-w-[1500px] px-0 pb-4 sm:px-6">
        <div className="pt-0 sm:pt-5">
          <HomeHero />
        </div>

        <div className="px-4 sm:px-0">
        <FeaturedSeries />
        <PromoShortcutGrid />

        <HomeSection title="Flash sale" eyebrow="Ưu đãi hôm nay" href="/products">
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3">
            <Flame size={20} className="text-[var(--brand-strong)]" aria-hidden="true" />
            <p className="mr-auto text-sm font-semibold text-zinc-800">Kết thúc trong</p>
            <FlashSaleCountdown endsAt="2026-12-31T23:59:59+07:00" />
          </div>
          <ProductShelf products={discountedProducts} />
        </HomeSection>

        <HomeSection title="Danh mục nổi bật" href="/products">
          {catalogCategories.length > 0 ? <FeaturedCategoryGrid categories={catalogCategories} /> : <p className="text-sm text-zinc-500">Chưa có danh mục được tạo.</p>}
        </HomeSection>

        <HomeSection title="Mô hình đã phát hành" eyebrow="Sẵn sàng cho bộ sưu tập" href="/products?type=IN_STOCK">
          <ProductShelf products={releasedProducts} />
        </HomeSection>

        <ServiceBanners />

        <HomeSection title="Mô hình đặt trước" eyebrow="Phiên bản sắp ra mắt" href="/preorder">
          <ProductShelf products={preorderProducts} />
        </HomeSection>

        <HomeSection title="Sản phẩm đang giảm giá" href="/products">
          <ProductShelf products={discountedProducts} />
        </HomeSection>

        <HomeSection title="Review và góc sưu tầm" eyebrow="Cảm hứng cho collector">
          <VideoReviewSection />
        </HomeSection>

        <HomeSection title="Thương hiệu được yêu thích">
          <BrandLogoCloud brands={options.brands} />
        </HomeSection>

        <HomeSection title="Tin tức nổi bật" eyebrow="Sự kiện và hướng dẫn">
          <NewsHighlight />
        </HomeSection>

        <HomeSection title="Tin tức mới nhất" href="/products">
          <LatestNewsSection />
        </HomeSection>
        </div>
      </div>
    </main>
  );
}
