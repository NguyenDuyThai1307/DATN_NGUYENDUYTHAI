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
    label: "Tu van",
    value: "Gui cau hoi ve san pham",
    href: "/products",
    icon: MessageCircle,
  },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
        Lien he
      </p>
      <h1 className="mt-2 text-3xl font-black text-zinc-950">
        Can ho tro ve figure?
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
        Day la trang lien he demo cho do an. Sau nay co the ket noi form lien
        he, ban do cua hang va kenh chat that.
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
            <h2 className="font-bold text-zinc-950">He thong cua hang</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Cua hang demo Figure Shop, Ha Noi. Thong tin chi tiet se duoc
              cap nhat khi co du lieu cua hang that.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex rounded-md bg-[var(--brand-strong)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#982934]"
            >
              Xem san pham dang ban
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
