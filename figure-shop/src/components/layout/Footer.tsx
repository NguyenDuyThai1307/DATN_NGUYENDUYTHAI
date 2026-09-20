import Link from "next/link";
import { Heart, MessageCircle, Package, Bot } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
const groups = [
  { title: "Về Figure Shop", links: [["Bộ sưu tập", "/collections"], ["Tin tức", "/news"], ["Thương hiệu", "/brands"], ["Liên hệ", "/contact"]] },
  { title: "Hỗ trợ khách hàng", links: [["Hướng dẫn mua hàng", "/guide"], ["Theo dõi đơn hàng", "/account/orders"], ["Sản phẩm yêu thích", "/wishlist"], ["Tư vấn với AI", "/ai"]] },
  { title: "Khám phá", links: [["Tất cả sản phẩm", "/products"], ["Hàng có sẵn", "/products?type=IN_STOCK"], ["Sản phẩm đặt trước", "/preorder"], ["Ưu đãi hôm nay", "/#offers"]] },
];
export function Footer() {
  return <footer className="store-footer mt-10 border-t border-zinc-200 bg-[#f8faff] pb-20 md:pb-0"><div className="mx-auto grid max-w-[1560px] gap-7 px-6 py-7 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr]">
    <div><Link href="/" aria-label="Figure Shop trang chủ"><BrandLogo /></Link><p className="mt-3 max-w-xs text-xs leading-5 text-zinc-500">Thế giới dành cho những người yêu mô hình.<br />Sưu tầm đam mê, kết nối cộng đồng otaku!</p></div>
    {groups.map(group => <div key={group.title}><h3 className="text-xs font-bold">{group.title}</h3><ul className="mt-3 space-y-2 text-xs text-zinc-500">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:text-blue-600">{label}</Link></li>)}</ul></div>)}
    <div><h3 className="text-xs font-bold">Luôn sẵn sàng hỗ trợ</h3><div className="mt-3 flex gap-3">{[{ Icon: MessageCircle, href: "/contact", label: "Liên hệ" }, { Icon: Bot, href: "/ai", label: "Tư vấn AI" }, { Icon: Package, href: "/account/orders", label: "Đơn hàng" }].map(({ Icon, href, label }) => <Link key={href} href={href} aria-label={label} className="grid size-9 place-items-center rounded-full bg-blue-600 text-white"><Icon size={18} /></Link>)}</div><p className="mt-3 text-xs leading-5 text-zinc-500">Cùng bạn tìm mô hình phù hợp cho bộ sưu tập.</p></div>
  </div><div className="mx-auto flex max-w-[1512px] flex-wrap justify-between gap-2 border-t border-zinc-200 px-4 py-3 text-[11px] text-zinc-500"><span>© {new Date().getFullYear()} Figure Shop.</span><span className="flex items-center gap-3">For a More Colorful Otaku Life <Heart size={13} className="text-red-500" /></span></div></footer>;
}
