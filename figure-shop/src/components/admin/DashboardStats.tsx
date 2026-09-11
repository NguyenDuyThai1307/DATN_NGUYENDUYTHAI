import {
  Boxes,
  CheckCircle2,
  Clock3,
  ReceiptText,
  UsersRound,
} from "lucide-react";

type DashboardStatsProps = {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    pendingOrders: number;
    completedOrders: number;
    paidRevenue: number;
    demoRevenue: number;
    sandboxRevenue: number;
    legacyPaidRevenue: number;
    liveTestRevenue: number;
    needsReviewCount: number;
  };
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
    {
      label: "Sản phẩm",
      value: stats.totalProducts,
      helper: "Tổng SKU trong hệ thống",
      icon: Boxes,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Đơn hàng",
      value: stats.totalOrders,
      helper: "Tất cả đơn đã tạo",
      icon: ReceiptText,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Người dùng",
      value: stats.totalUsers,
      helper: "Tài khoản khách hàng và nhân sự",
      icon: UsersRound,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Chờ xử lý",
      value: stats.pendingOrders,
      helper: "Cần admin theo dõi",
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Hoàn thành",
      value: stats.completedOrders,
      helper: "Đơn đã kết thúc",
      icon: CheckCircle2,
      tone: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-zinc-500">{item.label}</p>
              <span
                className={`grid size-9 place-items-center rounded-full ${item.tone}`}
              >
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-black tracking-tight text-zinc-950">
              {item.value}
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {item.helper}
            </p>
          </div>
        );
      })}
    </div>
  );
}
