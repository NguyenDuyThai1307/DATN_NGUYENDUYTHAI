import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, Box, CalendarDays, ChevronDown, Coins, ShoppingCart, TicketPercent, UserRound, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import type { DashboardOverview as Overview } from "@/services/admin-dashboard.service";
import { LOW_STOCK_THRESHOLD } from "@/services/admin-dashboard.service";
import { percentageChange } from "@/lib/dashboard-range";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { DashboardOrderChart, DashboardRevenueChart } from "./DashboardCharts";

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")} đ`;
const date = (value: Date) => value.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" });
const displayKey = (value: string) => value.split("-").reverse().join("/");

function Panel({ title, href, children, className = "" }: { title: string; href?: string; children: ReactNode; className?: string }) {
  return <section className={`dashboard-panel ${className}`}><div className="dashboard-panel-heading"><h2>{title}</h2>{href && <Link href={href}>Xem tất cả <ArrowRight size={12} /></Link>}</div>{children}</section>;
}
function Empty({ children }: { children: ReactNode }) { return <p className="dashboard-empty">{children}</p>; }
function Thumbnail({ src, name }: { src?: string | null; name: string }) {
  return <span className="dashboard-thumbnail">{src ? <Image src={src} alt={name} fill sizes="38px" className="object-contain" /> : <Box size={20} aria-hidden="true" />}</span>;
}
function Trend({ current, previous }: { current: number; previous: number }) {
  const value = percentageChange(current, previous);
  if (value === null) return <p className="dashboard-trend">Chưa có dữ liệu kỳ trước để so sánh</p>;
  const Icon = value < 0 ? ArrowDown : ArrowUp;
  return <p className="dashboard-trend"><Icon size={12} /><strong>{Math.abs(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%</strong> so với kỳ trước</p>;
}

export function DashboardOverview({ data: d, isAdmin }: { data: Overview; isAdmin: boolean }) {
  const points = d.revenue.daily.map((row, index) => ({ date: new Date(d.range.start.getTime() + index * 86_400_000 + 7 * 3_600_000).toISOString().slice(0, 10), value: row.cod + row.transfer }));
  const cards = [
    { label: "Tổng đơn hàng", value: d.totalOrders.toLocaleString("vi-VN"), Icon: ShoppingCart, trend: <Trend current={d.totalOrders} previous={d.previousOrders} /> },
    { label: "Doanh thu", value: money(d.revenue.total), Icon: Coins, trend: <Trend current={d.revenue.total} previous={d.revenue.previous} /> },
    { label: "Khách hàng mới", value: d.newCustomers.toLocaleString("vi-VN"), Icon: UsersRound, trend: <Trend current={d.newCustomers} previous={d.previousCustomers} /> },
    { label: "Tổng sản phẩm", value: d.totalProducts.toLocaleString("vi-VN"), Icon: Box, trend: <p className="dashboard-trend">{d.addedProducts} sản phẩm mới trong kỳ</p> },
  ];
  return <main className="dashboard-page">
    <div className="dashboard-heading"><h1>Tổng quan</h1><details className="dashboard-range"><summary><CalendarDays size={16} />{displayKey(d.range.from)} <span>–</span> {displayKey(d.range.to)}<ChevronDown size={14} /></summary><form action="/admin" method="get"><label>Từ ngày<input type="date" name="start" defaultValue={d.range.from} required /></label><label>Đến ngày<input type="date" name="end" defaultValue={d.range.to} required /></label><button type="submit">Áp dụng</button><div><Link href="/admin">Tháng này</Link><Link href="/admin?period=7">7 ngày</Link><Link href="/admin?period=30">30 ngày</Link><Link href="/admin?period=90">90 ngày</Link></div></form></details></div>
    {d.range.error && <p role="alert" className="dashboard-warning">{d.range.error}</p>}
    <div className="dashboard-stats">{cards.map(({ label, value, Icon, trend }) => <section key={label} className="dashboard-stat"><span className="dashboard-stat-icon"><Icon size={26} strokeWidth={1.5} /></span><div><h2>{label}</h2><p className="dashboard-stat-value">{value}</p>{trend}</div></section>)}</div>
    <p className="dashboard-scope">Số liệu theo kỳ đã chọn, so sánh với {d.range.days} ngày liền trước · Giờ Việt Nam. Tổng sản phẩm và tồn kho là số liệu hiện tại.</p>
    <div className="dashboard-charts"><DashboardRevenueChart points={points} /><DashboardOrderChart statuses={d.statuses} /></div>
    <div className="dashboard-middle">
      <Panel title="Đơn hàng gần đây" href="/admin/orders">
        {d.recentOrders.length ? <div className="dashboard-table-scroll"><table><thead><tr>{["Mã đơn", "Khách hàng", "Ngày đặt", "Tổng tiền", "Trạng thái"].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{d.recentOrders.map(order => <tr key={order.id}><td><Link href={`/admin/orders/${order.id}`} className="dashboard-order-number" title={order.orderNumber}>{order.orderNumber}</Link></td><td>{order.user.name || "Khách hàng"}</td><td className="nowrap">{date(order.createdAt)}</td><td className="nowrap">{money(order.total)}</td><td><OrderStatusBadge status={order.status} /></td></tr>)}</tbody></table></div> : <Empty>Chưa có đơn hàng trong kỳ này.</Empty>}
      </Panel>
      <Panel title="Sản phẩm bán chạy" href="/admin/products">
        {d.bestSellers.length ? <div className="dashboard-table-scroll"><table><thead><tr><th>Sản phẩm</th><th>Đã bán</th><th>Thành tiền</th></tr></thead><tbody>{d.bestSellers.map((product, index) => <tr key={product.id ?? index}><td><div className="dashboard-product-cell"><Thumbnail src={product.image} name={product.name} />{product.id ? <Link href={`/admin/products/${product.id}/edit`}>{product.name}</Link> : <span>{product.name}</span>}</div></td><td>{product.quantity}</td><td className="nowrap">{money(product.total)}</td></tr>)}</tbody></table></div> : <Empty>Chưa có sản phẩm bán ra từ đơn đã thanh toán trong kỳ.</Empty>}
        <p className="dashboard-footnote">Đơn đã thanh toán; thành tiền sản phẩm trước coupon và phí vận chuyển.</p>
      </Panel>
      <Panel title="Khách hàng mới" href={isAdmin ? "/admin/users?role=CUSTOMER" : undefined}>
        {d.customers.length ? <div className="dashboard-table-scroll"><table><thead><tr><th>Khách hàng</th><th>Ngày đăng ký</th><th>Số đơn</th></tr></thead><tbody>{d.customers.map(user => <tr key={user.id}><td><div className="dashboard-customer-cell"><span><UserRound size={17} /></span>{isAdmin ? <Link href={`/admin/users/${user.id}`}>{user.name || "Khách hàng"}</Link> : user.name || "Khách hàng"}</div></td><td className="nowrap">{date(user.createdAt)}</td><td>{user._count.orders}</td></tr>)}</tbody></table></div> : <Empty>Chưa có khách hàng đăng ký trong kỳ này.</Empty>}
        <p className="dashboard-footnote">Số đơn tính trong khoảng ngày đã chọn.</p>
      </Panel>
    </div>
    <div className="dashboard-bottom">
      <Panel title="Hoạt động gần đây">
        {d.activities.length ? <ul className="dashboard-activity">{d.activities.map(activity => {
          const Icon = activity.kind === "order" ? ShoppingCart : activity.kind === "customer" ? UserRound : TicketPercent;
          const text = <><span className="dashboard-activity-icon"><Icon size={15} /></span><span className="dashboard-activity-text">{activity.text}</span><time dateTime={activity.at.toISOString()}>{date(activity.at)} {activity.at.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" })}</time></>;
          return <li key={activity.id}>{activity.kind !== "customer" || isAdmin ? <Link href={activity.href}>{text}</Link> : <div>{text}</div>}</li>;
        })}</ul> : <Empty>Chưa có hoạt động trong kỳ này.</Empty>}
      </Panel>
      <Panel title={`Tồn kho cần chú ý (${d.lowStockCount})`} href="/admin/products?status=ACTIVE&type=IN_STOCK" className="dashboard-inventory">
        <div id="inventory-alerts" className="scroll-mt-20" />
        {d.lowStock.length ? <div className="dashboard-table-scroll"><table><thead><tr><th>Sản phẩm</th><th>Mã sản phẩm</th><th>Tồn kho</th><th>Ngưỡng</th></tr></thead><tbody>{d.lowStock.map(product => <tr key={product.id}><td><div className="dashboard-product-cell"><Thumbnail src={product.images[0]?.url} name={product.name} /><Link href={`/admin/products/${product.id}/edit`}>{product.name}</Link></div></td><td><span className="dashboard-product-id" title={product.id}>{product.id}</span></td><td className="dashboard-stock-low">{product.stock}</td><td>{LOW_STOCK_THRESHOLD}</td></tr>)}</tbody></table></div> : <Empty>Không có sản phẩm có sẵn nào tồn kho từ {LOW_STOCK_THRESHOLD} trở xuống.</Empty>}
        <p className="dashboard-footnote">Hàng đang bán, loại có sẵn · Tồn kho hiện tại ≤ {LOW_STOCK_THRESHOLD} · Hiển thị tối đa 4 sản phẩm.</p>
      </Panel>
    </div>
    <p className="dashboard-finance-note">Doanh thu nội bộ gồm COD, chuyển khoản và demo đã thanh toán; loại đơn hủy, hoàn tiền và giao dịch cần đối soát. Giá trị demo là mô phỏng, không phải tiền thực thu.{d.revenue.estimatedDates > 0 && ` ${d.revenue.estimatedDates} đơn cũ thiếu ngày thanh toán được tính theo ngày tạo.`} <Link href="/admin/reports">Báo cáo chi tiết →</Link></p>
    {d.needsReviewCount > 0 && <p className="dashboard-warning">Có {d.needsReviewCount} giao dịch cần đối soát, chưa được tính vào doanh thu.</p>}
  </main>;
}
