import Link from "next/link";

const adminNavItems = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/promotions", label: "Khuyến mãi" },
  { href: "/admin/coupons", label: "Coupon" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/brands", label: "Thương hiệu" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/reports", label: "Báo cáo" },
];

export function AdminSidebar({ role }: { role: "STAFF" | "ADMIN" }) {
  return (
    <aside className="border-b border-zinc-200 bg-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="px-6 py-5">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          Admin
        </Link>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-6 pb-4 text-sm lg:flex-col lg:overflow-visible">
        {adminNavItems.filter(item => item.href !== "/admin/users" || role === "ADMIN").map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-md px-3 py-2 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
