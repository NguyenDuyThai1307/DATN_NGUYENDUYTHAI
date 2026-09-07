import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const contactItems = [
  {
    label: "Hotline",
    value: "0900 000 000",
    href: "tel:0900000000",
    icon: Phone,
  },
  {
    label: "Email",
    value: "hello@figureshop.vn",
    href: "mailto:hello@figureshop.vn",
    icon: Mail,
  },
  {
    label: "Tư vấn",
    value: "Gửi câu hỏi về sản phẩm",
    href: "/products",
    icon: MessageCircle,
  },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
        Liên hệ
      </p>
      <h1 className="mt-2 text-3xl font-black text-zinc-950">
        Cần hỗ trợ về mô hình?
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
        Đây là trang liên hệ demo cho đồ án. Sau này có thể kết nối form liên
        hệ, bản đồ cửa hàng và kênh chat thật.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {contactItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href={item.href}
              className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-rose-200 hover:bg-rose-50"
            >
              <Icon
                size={22}
                className="text-[var(--brand-strong)]"
                aria-hidden="true"
              />
              <p className="mt-4 text-sm font-medium text-zinc-500">
                {item.label}
              </p>
              <p className="mt-1 font-bold text-zinc-950">{item.value}</p>
            </a>
          );
        })}
      </section>

      <section
        id="stores"
        className="mt-8 rounded-lg border border-zinc-200 bg-white p-6"
      >
        <div className="flex items-start gap-3">
          <MapPin
            size={24}
            className="mt-1 shrink-0 text-[var(--brand-strong)]"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-bold text-zinc-950">Hệ thống cửa hàng</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Cửa hàng demo Figure Shop, Hà Nội. Thông tin chi tiết sẽ được
              cập nhật khi có dữ liệu cửa hàng thật.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex rounded-md bg-[var(--brand-strong)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#982934]"
            >
              Xem sản phẩm đang bán
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
