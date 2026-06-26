import Link from "next/link";
import { Globe2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

const footerGroups = [
  {
    title: "Ho tro khach hang",
    links: [
      { label: "Huong dan mua hang", href: "/guide" },
      { label: "Huong dan thanh toan", href: "/guide" },
      { label: "Tra cuu don hang", href: "/account/orders" },
      { label: "Cau hoi thuong gap", href: "/guide" },
    ],
  },
  {
    title: "Chinh sach",
    links: [
      { label: "Van chuyen", href: "/guide" },
      { label: "Bao mat thong tin", href: "/guide" },
      { label: "Kiem hang", href: "/guide" },
      { label: "Doi tra", href: "/guide" },
    ],
  },
  {
    title: "Khuyen mai",
    links: [
      { label: "San pham moi", href: "/products" },
      { label: "Uu dai trong thang", href: "/products?sort=price_asc" },
      { label: "Hang dat truoc", href: "/preorder" },
      { label: "Ma giam gia", href: "/products?sort=price_asc" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t-4 border-[var(--brand)] bg-white pb-20 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.25fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-black text-zinc-950">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--brand-strong)] text-white">F</span>
            Figure Shop
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-600">Cua hang danh cho nguoi yeu figure va mo hinh suu tam. Chon hang ro rang, dong goi can than, ho tro nhanh.</p>
          <div className="mt-5 flex gap-2">
            {[Globe2, MessageCircle, Send].map((Icon, index) => (
              <a key={index} href="#" aria-label="Kenh mang xa hoi Figure Shop" className="grid h-9 w-9 place-items-center rounded-md border border-zinc-200 text-zinc-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-[var(--brand-strong)]">
                <Icon size={17} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-bold text-zinc-950">{group.title}</h3>
            <ul className="mt-4 grid gap-2.5 text-sm text-zinc-600">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-[var(--brand-strong)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-200">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-7 text-sm text-zinc-600 md:grid-cols-3">
          <p className="inline-flex items-start gap-2"><MapPin size={17} className="mt-0.5 shrink-0 text-[var(--brand-strong)]" aria-hidden="true" />Cua hang demo Figure Shop, Ha Noi</p>
          <a href="mailto:hello@figureshop.vn" className="inline-flex items-center gap-2 hover:text-[var(--brand-strong)]"><Mail size={17} className="text-[var(--brand-strong)]" aria-hidden="true" />hello@figureshop.vn</a>
          <a href="tel:0900000000" className="inline-flex items-center gap-2 hover:text-[var(--brand-strong)]"><Phone size={17} className="text-[var(--brand-strong)]" aria-hidden="true" />0900 000 000</a>
        </div>
      </div>
    </footer>
  );
}
