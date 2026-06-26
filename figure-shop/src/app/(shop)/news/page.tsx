import Link from "next/link";
import { latestNews } from "@/data/home-content";

export default function NewsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
        Tin tuc
      </p>
      <h1 className="mt-2 text-3xl font-black text-zinc-950">
        Cap nhat cho nguoi suu tam figure
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
        Cac bai viet demo ve cach chon figure, bao quan mo hinh va lich
        pre-order. Phan nay co the thay bang CMS hoac bang admin sau.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {latestNews.map((article) => (
          <article
            key={article.title}
            className="flex min-h-64 flex-col rounded-lg border border-zinc-200 bg-white p-5"
          >
            <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
              {article.date}
            </p>
            <h2 className="mt-4 text-lg font-bold leading-7 text-zinc-950">
              {article.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600">
              {article.excerpt}
            </p>
            <Link
              href={article.href}
              className="mt-5 text-sm font-bold text-[var(--brand-strong)] hover:text-zinc-950"
            >
              Xem them san pham lien quan
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
