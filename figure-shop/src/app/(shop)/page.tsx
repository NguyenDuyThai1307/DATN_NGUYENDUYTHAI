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
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="grid gap-4 pt-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:pt-6">
          <HomeHero />
          <NewsHighlight />
        </div>

        <FeaturedSeries />
        <PromoShortcutGrid />

        <HomeSection title="Flash sale" eyebrow="Uu dai hom nay" href="/products">
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3">
            <Flame size={20} className="text-[var(--brand-strong)]" aria-hidden="true" />
            <p className="mr-auto text-sm font-semibold text-zinc-800">Ket thuc trong</p>
            <FlashSaleCountdown endsAt="2026-12-31T23:59:59+07:00" />
          </div>
          <ProductShelf products={discountedProducts} />
        </HomeSection>

        <HomeSection title="Danh muc noi bat" href="/products">
          {catalogCategories.length > 0 ? <FeaturedCategoryGrid categories={catalogCategories} /> : <p className="text-sm text-zinc-500">Chua co danh muc duoc tao.</p>}
        </HomeSection>

        <HomeSection title="Mo hinh da phat hanh" eyebrow="San san cho bo suu tap" href="/products?type=IN_STOCK">
          <ProductShelf products={releasedProducts} />
        </HomeSection>

        <ServiceBanners />

        <HomeSection title="Mo hinh dat truoc" eyebrow="Phien ban sap ra mat" href="/preorder">
          <ProductShelf products={preorderProducts} />
        </HomeSection>

        <HomeSection title="San pham dang giam gia" href="/products">
          <ProductShelf products={discountedProducts} />
        </HomeSection>

        <HomeSection title="Review va goc suu tam" eyebrow="Cam hung cho collector">
          <VideoReviewSection />
        </HomeSection>

        <HomeSection title="Thuong hieu duoc yeu thich">
          <BrandLogoCloud brands={options.brands} />
        </HomeSection>

        <HomeSection title="Tin tuc moi nhat" href="/products">
          <LatestNewsSection />
        </HomeSection>
      </div>
    </main>
  );
}
