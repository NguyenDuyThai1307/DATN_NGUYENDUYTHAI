import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  Boxes,
  CircleHelp,
  Sparkles,
  Truck,
} from "lucide-react";

export const featuredSeries = [
  "One Piece",
  "Hatsune Miku",
  "Hololive",
  "Dragon Ball",
  "Demon Slayer",
  "Jujutsu Kaisen",
  "Frieren",
  "Evangelion",
  "Pokemon",
  "Gundam",
];

export const promoShortcuts: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  imageUrl: string;
}[] = [
  {
    title: "Figure co san",
    description: "San pham san sang giao",
    href: "/products?type=IN_STOCK",
    icon: Boxes,
    imageUrl: "/images/products/luffy-gear-5.jpg",
  },
  {
    title: "Deal san pham",
    description: "Figure dang co uu dai",
    href: "/products",
    icon: BadgePercent,
    imageUrl: "/images/products/miku-sakura.jpg",
  },
  {
    title: "Dat truoc",
    description: "Mo ban cac phien ban moi",
    href: "/preorder",
    icon: Sparkles,
    imageUrl: "/images/products/yasuo-figure-riot.jpg",
  },
];

export const serviceLinks: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Huong dan mua hang",
    description: "Quy trinh dat figure don gian",
    icon: CircleHelp,
  },
  {
    title: "Dong goi ky luong",
    description: "Bao ve hop va phu kien khi giao",
    icon: Boxes,
  },
  {
    title: "Giao hang toan quoc",
    description: "Cap nhat don hang ro rang",
    icon: Truck,
  },
];

export const latestNews = [
  {
    date: "12/06/2026",
    title: "Cach bao quan figure de giu mau son ben dep",
    excerpt: "Mot vai thoi quen nho giup tu figure cua ban luon sach va an toan.",
    href: "/products",
  },
  {
    date: "08/06/2026",
    title: "Phan biet figure scale va prize figure",
    excerpt: "Goi y nhanh de chon dung dong figure theo muc tieu su tam.",
    href: "/products",
  },
  {
    date: "02/06/2026",
    title: "Lich pre-order figure thang nay",
    excerpt: "Theo doi nhung phien ban dang nhan dat truoc tai Figure Shop.",
    href: "/preorder",
  },
];

export const videoReviews = [
  {
    title: "Mo hop Luffy Gear 5",
    description: "Goc nhin nhanh ve do hoan thien, mau sac va cach trung bay.",
    thumbnailUrl: "/images/products/luffy-gear-5.jpg",
  },
  {
    title: "Setup goc trung bay Miku",
    description: "Goi y phoi mau va anh sang cho ke figure nho.",
    thumbnailUrl: "/images/products/miku-sakura.jpg",
  },
  {
    title: "Pre-order figure can luu y gi",
    description: "Checklist ngan truoc khi dat truoc cac phien ban moi.",
    thumbnailUrl: "/images/products/yasuo-figure-riot.jpg",
  },
];
