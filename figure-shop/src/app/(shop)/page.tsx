import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeHero } from "@/components/home/HomeHero";
import { ProductShelf } from "@/components/home/ProductShelf";
import { isPromotionActive } from "@/services/pricing.service";
import { getActiveProducts, getProductFilterOptions } from "@/services/product.service";

export default async function HomePage() {
  const [products, options] = await Promise.all([
    getActiveProducts(), getProductFilterOptions(),
  ]);
  const pictured = products.filter(product => Boolean(product.images[0]?.url?.trim()));
  const offers = pictured.filter(product => product.type === "IN_STOCK" && product.promotion && isPromotionActive(product.promotion));
  const categoryProducts = (slug: string) => pictured.filter(product => product.category?.slug === slug || product.categories.some(link => link.category.slug === slug));
  const featuredPicks = ["luffy-gear-5", "gojo", "tanjiro", "nezuko", "nami", "goku"].flatMap(term => {
    const match = pictured.find(product => new RegExp(`(^|-)${term}(-|$)`).test(product.slug));
    return match ? [match] : [];
  });
  const featured = [...new Map([...featuredPicks, ...pictured].map(product => [product.id, product])).values()];
  const groups = [
    { id: "offers", label: "Sản phẩm ưu đãi", products: offers, limit: 8 },
    { id: "featured", label: "Sản phẩm nổi bật", products: featured, href: "/products" },
    { id: "scale", label: "Figure Scale", products: categoryProducts("scale-figure"), href: "/collections/scale-figure" },
    { id: "nendoroid", label: "Nendoroid", products: categoryProducts("nendoroid"), href: "/collections/nendoroid" },
    { id: "action", label: "Mô hình có khớp", products: categoryProducts("action-figure"), href: "/collections/action-figure" },
    { id: "kit", label: "Mô hình - Kit", products: categoryProducts("model-kit"), href: "/collections/model-kit" },
    { id: "preorder", label: "Hàng đặt trước · Pre-order", products: pictured.filter(product => product.type === "PREORDER"), href: "/preorder" },
  ];
  const series = [
    { name: "One Piece", query: "Luffy" },
    { name: "Naruto", query: "Naruto" },
    { name: "Demon Slayer", query: "Tanjiro" },
    { name: "Jujutsu Kaisen", query: "Gojo" },
    { name: "Dragon Ball", query: "Goku" },
    { name: "Hatsune Miku", query: "Miku" },
  ].flatMap(item => {
    const product = pictured.find(product => new RegExp(`\\b${item.query}\\b`, "i").test(product.name));
    return product ? [{ name: item.name, href: `/products?q=${encodeURIComponent(item.query)}`, image: product.images[0].url }] : [];
  });
  const categoryTiles = ["nendoroid", "action-figure", "scale-figure", "model-kit"].flatMap(slug => {
    const category = options.categories.find(category => category.slug === slug);
    const product = categoryProducts(slug)[0];
    const labels: Record<string, string> = { nendoroid: "Nendoroid", "action-figure": "Action Figure", "scale-figure": "Scale Figure", "model-kit": "Mô hình - Kit" };
    return category && product ? [{ name: labels[slug], href: `/collections/${slug}`, image: product.images[0].url }] : [];
  });
  const tiles = [...series, ...categoryTiles];
  const poster = pictured.find(product => /asuka/i.test(product.name)) ?? pictured[0];

  return (
    <main className="home-reference">
      <div className="home-container">
        <HomeHero />
        <div className="home-showcase">
          <div className="home-showcase-main">
            <section aria-labelledby="home-categories-title" className="home-categories">
              <div className="home-section-heading">
                <h2 id="home-categories-title">Danh mục nổi bật</h2>
                <Link href="/collections">Xem tất cả <ArrowRight size={14} /></Link>
              </div>
              <div className="home-category-list">
                {tiles.map(tile => <Link key={tile.href} href={tile.href} className="home-category-tile">
                  <span className="home-category-image"><Image src={tile.image} alt="" fill sizes="90px" className="object-contain" /></span>
                  <span>{tile.name}</span>
                </Link>)}
                {!tiles.length && <p className="text-sm text-zinc-500">Danh mục đang được cập nhật.</p>}
              </div>
            </section>

            {groups.filter(group => group.id === "offers" || group.products.length > 0).map(group => (
              <section key={group.id} id={group.id} className={`home-featured home-product-section scroll-mt-36 ${group.id === "offers" ? "home-offers" : ""}`} aria-labelledby={`home-${group.id}-title`}>
                <div className="home-featured-heading">
                  <h2 id={`home-${group.id}-title`}>{group.label}</h2>
                  {group.id === "offers" && <span className="home-offer-count">{Math.min(group.products.length, 8)} sản phẩm ưu đãi</span>}
                  {group.href && <Link href={group.href} className="home-view-all">Xem tất cả <ArrowRight size={14} /></Link>}
                </div>
                <ProductShelf products={group.products.slice(0, group.limit ?? 6)} compact />
              </section>
            ))}
          </div>

          {poster && <Link href={`/products/${poster.slug}`} className="home-passion-banner">
            <span className="home-passion-art">
              <Image src={poster.images[0].url} alt={poster.name} fill sizes="(min-width: 1280px) 210px, (min-width: 1024px) 180px, 240px" className="object-contain" />
              <span className="home-passion-brand">FIGURE <b>SHOP</b></span>
            </span>
            <span className="home-passion-copy"><strong>SỐNG CÙNG<br /><em>ĐAM MÊ</em></strong><span>Cho những tâm hồn<br />yêu thế giới mô hình.</span><span className="home-passion-cta">Khám phá ngay <ArrowRight size={14} /></span></span>
          </Link>}
        </div>
      </div>
    </main>
  );
}
