import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative isolate min-h-[430px] overflow-hidden bg-[#e94535] sm:min-h-[520px] sm:rounded-2xl">
      <Image
        src="/images/home/figure-shop-hero-custom.png"
        alt="Bộ sưu tập mô hình phong cách tương lai"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[58%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/62 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/18 to-transparent" />

      <div className="relative z-10 flex min-h-[430px] max-w-2xl flex-col justify-center px-6 py-12 text-white sm:min-h-[520px] sm:px-10 lg:px-16">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-rose-50 ring-1 ring-white/20">
          <Sparkles size={16} aria-hidden="true" />
          Bộ sưu tập mới
        </p>
        <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          Mô hình đẹp cho góc sưu tầm của bạn
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-6 text-rose-50 sm:text-base">
          Khám phá mô hình có sẵn và đặt trước được chọn lọc, thông tin rõ ràng
          và đóng gói cẩn thận.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-[var(--brand-strong)] shadow-sm transition hover:bg-rose-50"
          >
            Kham pha sản phẩm
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link
            href="/preorder"
            className="inline-flex items-center rounded-md border border-white/60 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Xem hàng đặt trước
          </Link>
        </div>
      </div>
    </section>
  );
}
