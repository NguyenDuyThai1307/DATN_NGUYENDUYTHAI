import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HomeHero() {
  return (
    <div className="relative isolate min-h-[430px] overflow-hidden bg-[var(--brand-strong)] sm:min-h-[500px]">
      <Image
        src="/images/home/figure-shop-hero.png"
        alt="Bo suu tap figure phong cach tuong lai"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center]"
      />
      <div className="absolute inset-y-0 left-0 w-full bg-[#8d2733]/85 sm:w-[58%]" />
      <div className="relative z-10 flex min-h-[430px] max-w-xl flex-col justify-center px-6 py-12 text-white sm:min-h-[500px] sm:px-10 lg:px-14">
        <p className="inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-wide text-rose-100">
          <Sparkles size={16} aria-hidden="true" />
          Bo suu tap moi
        </p>
        <h1 className="mt-4 max-w-lg text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          Figure dep cho goc suu tam cua ban
        </h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-rose-50 sm:text-base">
          Kham pha figure co san va pre-order duoc chon loc, thong tin ro rang
          va dong goi can than.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[var(--brand-strong)] transition hover:bg-rose-50"
          >
            Kham pha san pham
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link
            href="/preorder"
            className="inline-flex items-center rounded-md border border-white/60 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Xem pre-order
          </Link>
        </div>
      </div>
    </div>
  );
}
