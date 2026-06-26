import { BadgeCheck, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const commitments = [
  { title: "Hang chinh hang", icon: BadgeCheck },
  { title: "Dong goi can than", icon: PackageCheck },
  { title: "Tu van ro rang", icon: ShieldCheck },
  { title: "Giao hang toan quoc", icon: Truck },
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
