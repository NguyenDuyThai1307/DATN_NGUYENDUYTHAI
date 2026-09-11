import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeHero() {
  return (
    <section className="home-hero overflow-hidden rounded-2xl border border-zinc-200 bg-[#f1efed] sm:rounded-3xl">
      <div className="grid md:min-h-[440px] md:grid-cols-2">
        <div className="hero-copy flex flex-col items-start justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-strong)]">Dành cho người yêu mô hình</p>
          <h1 className="mt-4 max-w-lg text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">Góc nhỏ của bạn.<br /><span className="text-[var(--brand-strong)]">Đam mê thật lớn.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-zinc-600 sm:text-base">Tìm nhân vật yêu thích, hoàn thiện bộ sưu tập. Khám phá mô hình có sẵn và những phiên bản đang nhận đặt trước.</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link href="/products" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand-strong)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#982934]">Khám phá sản phẩm<ArrowRight size={17} aria-hidden="true" /></Link>
            <Link href="/preorder" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-zinc-700 underline-offset-4 hover:underline">Xem preorder<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="hero-art relative aspect-[4/3] overflow-hidden bg-zinc-900 md:aspect-auto">
          <Image src="/images/home/figure-shop-hero-hd.png" alt="Mô hình nữ kiếm sĩ trang phục đen đỏ trên đế trưng bày, phía sau là vòng sáng vàng" fill priority sizes="(min-width: 1280px) 640px, (min-width: 768px) 50vw, 100vw" className="object-cover object-center" />
        </div>
      </div>
    </section>
  );
}
