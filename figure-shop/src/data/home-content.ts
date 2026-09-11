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
    title: "Mô hình có sẵn",
    description: "Sản phẩm sẵn sàng giao",
    href: "/products?type=IN_STOCK",
    icon: Boxes,
    imageUrl: "/images/products/luffy-gear-5.jpg",
  },
  {
    title: "Deal sản phẩm",
    description: "Mô hình đang có ưu đãi",
    href: "/products",
    icon: BadgePercent,
    imageUrl: "/images/products/miku-sakura.jpg",
  },
  {
    title: "Đặt trước",
    description: "Mở bán các phiên bản mới",
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
    title: "Hướng dẫn mua hàng",
    description: "Quy trình đặt mô hình đơn giản",
    icon: CircleHelp,
  },
  {
    title: "Đóng gói kỹ lưỡng",
    description: "Bảo vệ hộp và phụ kiện khi giao",
    icon: Boxes,
  },
  {
    title: "Giao hàng toàn quốc",
    description: "Cập nhật đơn hàng rõ ràng",
    icon: Truck,
  },
];

export const latestNews = [
  {
    date: "12/06/2026",
    title: "Cách bảo quản mô hình để giữ màu sơn bền đẹp",
    excerpt: "Một vài thói quen nhỏ giúp tủ mô hình của bạn luôn sạch và an toàn.",
    href: "/products",
  },
  {
    date: "08/06/2026",
    title: "Phân biệt mô hình tỉ lệ và mô hình prize",
    excerpt: "Gợi ý nhanh để chọn đúng dòng mô hình theo mục tiêu sưu tầm.",
    href: "/products",
  },
  {
    date: "02/06/2026",
    title: "Lịch đặt trước mô hình tháng này",
    excerpt: "Theo dõi những phiên bản đang nhận đặt trước tại Figure Shop.",
    href: "/preorder",
  },
];

export const videoReviews = [
  {
    title: "Luffy trong bộ sưu tập của bạn",
    description: "Khám phá các phiên bản Luffy và chọn điểm nhấn cho kệ mô hình.",
    href: "/products?q=Luffy",
    linkLabel: "Xem mô hình Luffy",
    thumbnailUrl: "/images/products/luffy-gear-5.jpg",
  },
  {
    title: "Setup góc trưng bày Miku",
    description: "Tìm phiên bản Miku phù hợp với màu sắc và không gian yêu thích.",
    href: "/products?q=Miku",
    linkLabel: "Xem mô hình Miku",
    thumbnailUrl: "/images/products/miku-sakura.jpg",
  },
  {
    title: "Đặt trước mô hình cần lưu ý gì",
    description: "Kiểm tra thông tin sản phẩm và quy trình mua hàng trước khi đặt trước.",
    href: "/guide",
    linkLabel: "Xem hướng dẫn mua hàng",
    thumbnailUrl: "/images/products/yasuo-figure-riot.jpg",
  },
];
