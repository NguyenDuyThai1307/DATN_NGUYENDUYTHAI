import { BadgeCheck, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const commitments = [
  { title: "Hàng chính hãng", icon: BadgeCheck },
  { title: "Đóng gói cẩn thận", icon: PackageCheck },
  { title: "Tư vấn rõ ràng", icon: ShieldCheck },
  { title: "Giao hàng toàn quốc", icon: Truck },
];

export function ServiceCommitments() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-4">
      {commitments.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.title} className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
            <Icon size={18} className="shrink-0 text-[var(--brand-strong)]" aria-hidden="true" />
            {item.title}
          </div>
        );
      })}
    </div>
  );
}
