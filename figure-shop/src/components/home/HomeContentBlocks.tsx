import Image from "next/image";
import Link from "next/link";
import { CirclePlay, Copy, PackageCheck } from "lucide-react";
import {
  featuredSeries,
  latestNews,
  promoShortcuts,
  serviceLinks,
  videoReviews,
} from "@/data/home-content";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  imageUrl?: string;
};

export function FeaturedSeries() {
  return (
    <section className="py-7 sm:py-10">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-7">
        <p className="text-sm font-bold uppercase text-zinc-950">Series nổi bật</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {featuredSeries.map((series) => (
            <Link key={series} href={`/products?q=${encodeURIComponent(series)}`} className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-[var(--brand)] hover:bg-white hover:text-[var(--brand-strong)]">
              {series}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsHighlight() {
  return (
    <aside className="rounded-lg border border-zinc-200 bg-white p-5">
      <p className="text-sm font-bold uppercase text-zinc-950">Tin tức nổi bật</p>
      <div className="mt-4 divide-y divide-zinc-100">
        {latestNews.map((article) => (
          <Link key={article.title} href={article.href} className="block py-4 first:pt-0 last:pb-0">
            <p className="text-xs font-bold text-[var(--brand-strong)]">{article.date}</p>
            <p className="mt-1 font-semibold leading-5 text-zinc-900 transition hover:text-[var(--brand-strong)]">{article.title}</p>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export function PromoShortcutGrid() {
  return (
    <section className="grid gap-4 py-3 md:grid-cols-3">
      {promoShortcuts.map((shortcut, index) => {
        const Icon = shortcut.icon;

        return (
          <Link key={shortcut.title} href={shortcut.href} className="group relative min-h-52 overflow-hidden rounded-lg bg-zinc-900 p-6 text-white">
            <Image src={shortcut.imageUrl} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
            <div className={`absolute inset-0 ${index === 1 ? "bg-zinc-950/60" : "bg-[var(--brand-strong)]/75"}`} />
            <div className="relative z-10 flex h-full max-w-[60%] flex-col justify-between">
              <Icon size={24} aria-hidden="true" />
              <div>
                <p className="text-xl font-black">{shortcut.title}</p>
                <p className="mt-1 text-sm text-white/85">{shortcut.description}</p>
                <span className="mt-4 inline-flex rounded-md bg-white px-3 py-2 text-xs font-bold text-zinc-950 transition group-hover:bg-rose-50">Xem ngay</span>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}

export function FeaturedCategoryGrid({ categories }: { categories: CategoryItem[] }) {
  return (
    <div className="grid overflow-hidden rounded-lg border border-zinc-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/collections/${category.slug}`}
          className="group relative min-h-44 overflow-hidden border-b border-r border-zinc-200 p-5 transition hover:bg-rose-50 sm:last:border-b-0 lg:border-b-0"
        >
          {category.imageUrl ? (
            <div className="pointer-events-none absolute bottom-3 right-3 h-24 w-24 overflow-hidden rounded-2xl opacity-20 transition duration-300 group-hover:scale-110 group-hover:opacity-35">
              <Image
                src={category.imageUrl}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold text-zinc-950">{category.name}</p>
              <p className="mt-1 text-sm text-zinc-500">{category.productCount} sản phẩm</p>
            </div>
            <PackageCheck size={20} className="text-[var(--brand)]" aria-hidden="true" />
          </div>

          <span className="relative z-10 mt-12 inline-flex text-xs font-bold text-[var(--brand-strong)]">
            Xem danh mục
          </span>
        </Link>
      ))}
    </div>
  );
}

export function ServiceBanners() {
  return (
    <section className="grid gap-4 py-7 sm:grid-cols-3 sm:py-10">
      {serviceLinks.map((item) => {
        const Icon = item.icon;

        return (
          <Link key={item.title} href="/products" className="group rounded-lg border border-rose-100 bg-rose-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
            <Icon size={24} className="text-[var(--brand-strong)]" aria-hidden="true" />
            <p className="mt-5 font-bold text-zinc-950">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{item.description}</p>
          </Link>
        );
      })}
    </section>
  );
}

export function VideoReviewSection() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {videoReviews.map((review) => (
        <article
          key={review.title}
          className="group overflow-hidden rounded-lg border border-zinc-200 bg-white"
        >
          <div className="relative aspect-video overflow-hidden bg-zinc-100">
            <Image
              src={review.thumbnailUrl}
              alt={review.title}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-zinc-950/25 transition group-hover:bg-zinc-950/15" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid size-12 place-items-center rounded-full bg-white/90 text-[var(--brand-strong)] shadow-sm">
                <CirclePlay size={30} aria-hidden="true" />
              </span>
            </div>
          </div>
          <div className="p-4">
            <p className="font-bold text-zinc-950">{review.title}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {review.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function BrandLogoCloud({ brands }: { brands: { id: string; name: string; slug: string }[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
      {brands.length > 0 ? brands.map((brand) => (
        <Link key={brand.id} href={`/products?brandId=${brand.id}`} className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-[var(--brand-strong)]">
          {brand.name}
        </Link>
      )) : <p className="text-sm text-zinc-500">Thương hiệu sẽ được cập nhật sớm.</p>}
    </div>
  );
}

export function LatestNewsSection() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {latestNews.map((article) => (
        <article key={article.title} className="rounded-lg border border-zinc-200 bg-white p-5">
          <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">{article.date}</p>
          <h3 className="mt-3 text-lg font-bold text-zinc-950">{article.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{article.excerpt}</p>
          <Link href={article.href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-strong)] hover:text-zinc-950">
            Đọc thêm <Copy size={14} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}
