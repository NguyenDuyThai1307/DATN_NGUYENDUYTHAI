import Link from "next/link";
import { CheckCircle2, CreditCard, PackageCheck, Truck } from "lucide-react";

const steps = [
  {
    title: "Chọn sản phẩm",
    description: "Tìm mô hình theo danh mục, thương hiệu, tình trạng có sẵn hoặc đặt trước.",
    icon: PackageCheck,
  },
  {
    title: "Thêm vào giỏ",
    description: "Kiểm tra số lượng, mã giảm giá và tổng thanh toán trước khi đặt hàng.",
    icon: CheckCircle2,
  },
  {
    title: "Thanh toán",
    description: "Hỗ trợ COD, chuyển khoản và thanh toán demo cho quá trình báo cáo.",
    icon: CreditCard,
  },
  {
    title: "Nhận hàng",
    description: "Đơn hàng được đóng gói cẩn thận và cập nhật trạng thái trong tài khoản.",
    icon: Truck,
  },
];

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
        Hỗ trợ mua hàng
      </p>
      <h1 className="mt-2 text-3xl font-black text-zinc-950">
        Hướng dẫn đặt mô hình tại Figure Shop
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
        Quy trình mua hàng được thiết kế đơn giản để bạn có thể theo dõi rõ
        giỏ hàng, thanh toán và trạng thái đơn hàng.
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
        <h2 className="font-bold text-zinc-950">Cần xem sản phẩm trước?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Bạn có thể lọc theo hàng có sẵn, pre-order, thương hiệu và khoảng
          giá để chọn nhanh sản phẩm phù hợp.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex rounded-md bg-[var(--brand-strong)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#982934]"
        >
          Xem danh sách sản phẩm
        </Link>
      </section>
    </main>
  );
}
