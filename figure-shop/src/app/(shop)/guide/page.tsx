import Link from "next/link";
import { CheckCircle2, CreditCard, PackageCheck, Truck } from "lucide-react";

const steps = [
  {
    title: "Chon san pham",
    description: "Tim figure theo danh muc, thuong hieu, tinh trang co san hoac pre-order.",
    icon: PackageCheck,
  },
  {
    title: "Them vao gio",
    description: "Kiem tra so luong, ma giam gia va tong thanh toan truoc khi dat hang.",
    icon: CheckCircle2,
  },
  {
    title: "Thanh toan",
    description: "Ho tro COD, chuyen khoan va demo payment cho qua trinh bao cao.",
    icon: CreditCard,
  },
  {
    title: "Nhan hang",
    description: "Don hang duoc dong goi can than va cap nhat trang thai trong tai khoan.",
    icon: Truck,
  },
];

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
        Ho tro mua hang
      </p>
      <h1 className="mt-2 text-3xl font-black text-zinc-950">
        Huong dan dat figure tai Figure Shop
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
        Quy trinh mua hang duoc thiet ke don gian de ban co the theo doi ro
        gio hang, thanh toan va trang thai don hang.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <article
              key={step.title}
              className="rounded-lg border border-zinc-200 bg-white p-5"
            >
              <div className="grid h-11 w-11 place-items-center rounded-md bg-rose-50 text-[var(--brand-strong)]">
                <Icon size={21} aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-bold text-zinc-950">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {step.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-lg border border-rose-100 bg-rose-50 p-6">
        <h2 className="font-bold text-zinc-950">Can xem san pham truoc?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Ban co the loc theo hang co san, pre-order, thuong hieu va khoang
          gia de chon nhanh san pham phu hop.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex rounded-md bg-[var(--brand-strong)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#982934]"
        >
          Xem danh sach san pham
        </Link>
      </section>
    </main>
  );
}
