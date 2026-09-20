"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bot, ChevronLeft, ChevronRight, Gift, Heart, PackageCheck, Truck } from "lucide-react";

const slides = [
  { image: "/images/home/figure-shop-hero-custom.png", alt: "Mô hình kiếm sĩ trong không gian trưng bày", title: "Sưu tầm đam mê – Kết nối cộng đồng", href: "/products", cta: "Khám phá ngay" },
  { image: "/images/home/figure-shop-hero-banner.png", alt: "Bộ sưu tập figure và mô hình lắp ráp", title: "Tìm điểm nhấn cho bộ sưu tập của bạn", href: "/preorder", cta: "Khám phá pre-order" },
];

export function HomeHero({ compact = false }: { compact?: boolean }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  return <div className={compact ? "home-hero-compact" : "home-hero-layout"}>
    <section aria-label={compact ? "Sản phẩm đặt trước" : "Bộ sưu tập nổi bật"} aria-roledescription={compact ? undefined : "carousel"} className="home-hero">
      <Image src={slide.image} alt={slide.alt} fill priority={!compact} sizes="(min-width: 1560px) 1140px, (min-width: 1024px) 73vw, 100vw" className="home-hero-art object-cover" />
      <div className="home-hero-shade" />
      <div className="hero-copy home-hero-copy">
        <p className="home-hero-eyebrow">{compact ? "Sản phẩm sắp ra mắt" : "Thế giới figure anime dành cho bạn"}</p>
        <h1>{compact ? "PRE-" : "FIGURE "}<span>{compact ? "ORDER" : "SHOP"}</span></h1>
        <p className="home-hero-tagline">{compact ? "Đặt trước ngay – Hoàn thiện bộ sưu tập!" : slide.title}</p>
        <div className="home-hero-perks"><span><PackageCheck size={21} />Đóng gói cẩn thận</span><span><Truck size={21} />Giao hàng tận nơi</span><span><Heart size={21} />Vì đam mê mô hình</span></div>
        {!compact && <Link href={slide.href} className="home-hero-cta">{slide.cta} <ArrowRight size={16} /></Link>}
      </div>
      {!compact && <>
        <button type="button" aria-label="Banner trước" className="home-hero-arrow home-hero-prev" onClick={() => setIndex((index + slides.length - 1) % slides.length)}><ChevronLeft size={18} /></button>
        <button type="button" aria-label="Banner tiếp theo" className="home-hero-arrow home-hero-next" onClick={() => setIndex((index + 1) % slides.length)}><ChevronRight size={18} /></button>
        <div className="home-hero-dots" aria-label="Chọn banner">{slides.map((item, position) => <button key={item.image} type="button" aria-label={`Banner ${position + 1}`} aria-pressed={index === position} onClick={() => setIndex(position)}><span /></button>)}</div>
      </>}
    </section>
    {!compact && <aside className="home-hero-sidebar">
      <Link href="/ai" className="home-ai-banner">
        <Image src="/images/products/sourced/azone-pureneemo-rem.webp" alt="" fill sizes="200px" className="home-ai-character" />
        <div className="home-ai-copy"><h2><Bot size={25} />AI Figure Assistant</h2><p>Tư vấn figure, tìm sản phẩm phù hợp, giải đáp thắc mắc cùng AI ngay!</p><span>Trò chuyện ngay <ArrowRight size={14} /></span></div>
      </Link>
      <Link href="/#offers" className="home-service-card"><Gift className="text-red-500" size={30} /><span><strong>Ưu đãi hôm nay</strong><small>Giá tốt cho bộ sưu tập của bạn</small></span><ChevronRight size={17} /></Link>
      <Link href="/account/orders" className="home-service-card"><Truck className="text-blue-600" size={30} /><span><strong>Theo dõi đơn hàng</strong><small>Kiểm tra đơn của bạn dễ dàng</small></span><ChevronRight size={17} /></Link>
    </aside>}
  </div>;
}
