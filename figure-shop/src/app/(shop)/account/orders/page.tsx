import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Heart, UserRound, Headphones } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersByUserId } from "@/services/order.service";
import { OrderHistory } from "@/components/account/OrderHistory";
import { LogoutButton } from "@/components/auth/LogoutButton";
export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account/orders");
  const orders = await getOrdersByUserId(user.id);
  return <main className="mx-auto grid max-w-[1560px] gap-7 px-4 py-7 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
    <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5"><div className="mb-5 flex items-center gap-3"><span className="grid size-12 place-items-center rounded-full bg-blue-100 text-blue-600"><UserRound size={28} /></span><span className="min-w-0"><strong className="block truncate">{user.name || "Tài khoản của bạn"}</strong><span className="block truncate text-xs text-zinc-500">{user.email}</span></span></div><nav className="space-y-2">{[{ href: "/account", label: "Thông tin tài khoản", Icon: UserRound }, { href: "/account/orders", label: "Đơn hàng của tôi", Icon: ClipboardList }, { href: "/wishlist", label: "Sản phẩm yêu thích", Icon: Heart }, { href: "/contact", label: "Liên hệ hỗ trợ", Icon: Headphones }].map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={href === "/account/orders" ? "page" : undefined} className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm ${href === "/account/orders" ? "bg-blue-50 font-semibold text-blue-600" : "hover:bg-zinc-50"}`}><Icon size={19} />{label}</Link>)}</nav><div className="mt-5 border-t border-zinc-200 pt-5"><LogoutButton /></div></aside>
    <section className="min-w-0"><h1 className="flex items-center gap-3 text-2xl font-bold"><ClipboardList size={28} className="text-blue-600" />Đơn hàng của tôi</h1><p className="mt-2 text-sm text-zinc-500">Theo dõi và quản lý các đơn hàng của bạn tại Figure Shop.</p><OrderHistory orders={orders} /></section>
  </main>;
}
