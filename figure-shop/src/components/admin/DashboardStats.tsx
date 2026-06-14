import { ProductPrice } from "@/components/product/ProductPrice";

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
    { label: "San pham", value: stats.totalProducts },
    { label: "Don hang", value: stats.totalOrders },
    { label: "Nguoi dung", value: stats.totalUsers },
    { label: "Cho xu ly", value: stats.pendingOrders },
    { label: "Hoan thanh", value: stats.completedOrders },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-md border border-zinc-200 bg-white p-5"
        >
          <p className="text-sm text-zinc-500">{item.label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">
            {item.value}
          </p>
        </div>
      ))}

      <div className="rounded-md border border-zinc-200 bg-white p-5 sm:col-span-2 xl:col-span-5">
        <p className="text-sm text-zinc-500">Doanh thu da thanh toan</p>
        <p className="mt-2 text-2xl font-bold tracking-tight">
          <ProductPrice price={stats.paidRevenue} />
        </p>
      </div>
    </div>
  );
}