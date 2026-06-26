import Link from "next/link";
import { ArrowUp, Gift, MessageCircle, Phone } from "lucide-react";

const supportActions = [
  {
    href: "tel:0900000000",
    label: "Goi tu van",
    icon: Phone,
  },
  {
    href: "/contact",
    label: "Nhan tin",
    icon: MessageCircle,
  },
  {
    href: "#top",
    label: "Tro ve dau trang",
    icon: ArrowUp,
  },
];

export function FloatingSupport() {
  return (
    <>
      <Link
        href="/register"
        className="fixed bottom-20 left-4 z-30 hidden items-center gap-2 rounded-full bg-[var(--brand-strong)] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#982934] lg:inline-flex"
      >
        <Gift size={18} aria-hidden="true" />
        Uu dai thanh vien
      </Link>

      <div className="fixed bottom-20 right-4 z-30 hidden flex-col gap-2 md:flex">
        {supportActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.label}
              href={action.href}
              aria-label={action.label}
              title={action.label}
              className="grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-[var(--brand)] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)]"
            >
              <Icon size={21} aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </>
  );
}
