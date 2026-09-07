import { ProductPrice } from "@/components/product/ProductPrice";
import {
  Boxes,
  CheckCircle2,
  Clock3,
  Coins,
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
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-800 p-5 text-white shadow-sm sm:col-span-2 xl:col-span-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-300">Doanh thu đã thanh toán</p>
            <p className="mt-2 text-3xl font-black tracking-tight">
              <ProductPrice price={stats.paidRevenue} />
            </p>
          </div>

          <span className="grid size-11 place-items-center rounded-full bg-white/10 text-amber-300 ring-1 ring-white/15">
            <Coins size={22} aria-hidden="true" />
          </span>
        </div>
      </div>

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
