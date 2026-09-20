import Link from "next/link";
import type { RevenueReport } from "@/lib/admin-revenue";

const money = (value: number) => `${Math.round(value).toLocaleString("vi-VN")} đ`;

export function RevenueOverview({ report: r, basePath = "/admin" }: { report: RevenueReport; basePath?: string }) {
  const peak = Math.max(1, ...r.daily.map((row) => row.cod + row.transfer));
  const change = r.previous > 0 ? ((r.total - r.previous) / r.previous * 100) : null;
  return (
    <section className="revenue-overview mt-6 space-y-5" aria-labelledby="revenue-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h2 id="revenue-title" className="text-xl font-bold">Theo dõi doanh thu</h2><p className="mt-1 text-sm text-zinc-500">{r.daily[0].date} – {r.daily.at(-1)?.date} · Giờ Việt Nam · Bao gồm hôm nay</p></div>
        <nav aria-label="Khoảng thời gian doanh thu" className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1">
          {[7, 30, 90].map((days) => <Link key={days} href={`${basePath}?period=${days}`} aria-current={days === r.days ? "page" : undefined} className={`rounded-lg px-4 py-2 text-sm font-semibold ${days === r.days ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>{days} ngày</Link>)}
        </nav>
      </div>
      <div className="revenue-metrics grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-6 text-blue-950">
          <p className="text-sm text-blue-800">Tổng giá trị đã thanh toán</p><p className="mt-3 break-words text-3xl font-black tabular-nums">{money(r.total)}</p>
          <p className="mt-3 text-sm text-blue-800">{change === null ? "Chưa có giá trị ở kỳ trước để tính tăng trưởng" : `${change >= 0 ? "+" : ""}${change.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}% so với ${r.days} ngày trước`}</p>
          <p className="mt-2 text-xs text-blue-700">Kỳ trước: {money(r.previous)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6"><p className="text-sm text-zinc-500">Đơn đã thanh toán</p><p className="mt-3 text-3xl font-black">{r.paidCount.toLocaleString("vi-VN")}</p><p className="mt-3 text-sm text-zinc-500">Trung bình {money(r.paidCount ? r.total / r.paidCount : 0)} / đơn</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><p className="text-sm text-amber-900">Chưa thanh toán · đơn tạo trong kỳ</p><p className="mt-3 break-words text-3xl font-black text-amber-950">{money(r.pending)}</p><p className="mt-3 text-sm text-amber-900">{r.pendingCount} đơn · chưa tính vào tổng đã thanh toán</p></div>
      </div>
      <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950">Báo cáo nội bộ gồm COD và chuyển khoản/demo. Giá trị demo là mô phỏng, không phải tiền thực thu. Chỉ tính đơn đã thanh toán, loại đơn hủy, hoàn tiền và giao dịch cần đối soát.</p>
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="font-bold">Giá trị thanh toán theo ngày</h3>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-600"><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-blue-600" aria-hidden="true" />COD</span><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-[#84b6ff]" aria-hidden="true" />Chuyển khoản / demo</span><span>Đỉnh: {money(peak === 1 && r.total === 0 ? 0 : peak)}</span></div>
          {r.paidCount === 0 ? <div className="flex h-56 items-center justify-center text-center text-sm text-zinc-500">Chưa có đơn đã thanh toán trong khoảng thời gian này.</div> : <div className="mt-5 overflow-x-auto pb-2">
            <div className="flex h-56 items-end gap-1 border-b border-zinc-200" style={{ minWidth: r.days > 30 ? 720 : 280 }} role="img" aria-label="Biểu đồ cột theo ngày. Số liệu đầy đủ trong bảng bên dưới.">
              {r.daily.map((row, index) => <div key={index} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${row.date}: COD ${money(row.cod)}, chuyển khoản/demo ${money(row.transfer)}`}>
                <div className="rounded-t bg-[#84b6ff]" style={{ height: `${row.transfer / peak * 100}%` }} /><div className="bg-blue-600" style={{ height: `${row.cod / peak * 100}%` }} />
              </div>)}
            </div>
            <div className="mt-2 flex justify-between text-xs text-zinc-500"><span>{r.daily[0].date}</span><span>{r.daily[Math.floor(r.days / 2)].date}</span><span>{r.daily.at(-1)?.date}</span></div>
          </div>}
          <details className="mt-4 text-sm"><summary className="cursor-pointer font-medium text-zinc-700">Xem số liệu từng ngày</summary><div className="mt-3 max-h-72 overflow-auto"><table className="w-full whitespace-nowrap text-right text-xs"><caption className="sr-only">Giá trị thanh toán theo ngày, đơn vị đồng</caption><thead><tr>{["Ngày", "COD", "CK / demo", "Tổng", "Số đơn"].map((label) => <th key={label} className="p-2">{label}</th>)}</tr></thead><tbody>{r.daily.map((row, i) => <tr key={i} className="border-t border-zinc-100"><th className="p-2 font-normal">{row.date}</th><td className="p-2">{money(row.cod)}</td><td className="p-2">{money(row.transfer)}</td><td className="p-2 font-medium">{money(row.cod + row.transfer)}</td><td className="p-2">{row.count}</td></tr>)}</tbody></table></div></details>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5"><h3 className="font-bold">Theo phương thức</h3><p className="mt-1 text-sm text-zinc-500">Tỷ trọng giá trị đã thanh toán</p><div className="mt-7 space-y-7">{[{ label: "COD", value: r.cod, color: "bg-emerald-600" }, { label: "Chuyển khoản / demo", value: r.transfer, color: "bg-violet-500" }].map((item) => <div key={item.label}><div className="flex justify-between gap-2 text-sm"><span>{item.label}</span><span>{r.total ? (item.value / r.total * 100).toFixed(1) : 0}%</span></div><p className="mt-2 text-xl font-bold tabular-nums">{money(item.value)}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${r.total ? item.value / r.total * 100 : 0}%` }} /></div></div>)}</div><p className="mt-7 text-xs leading-5 text-zinc-500">COD chỉ được ghi nhận khi trạng thái thanh toán là đã thanh toán. Đơn giao thành công nhưng chưa xác nhận thu tiền vẫn chưa được cộng.</p></div>
      </div>
      {r.estimatedDates > 0 && <p className="text-xs text-zinc-500">{r.estimatedDates} đơn cũ thiếu thời điểm thanh toán: tạm phân bổ theo ngày tạo đơn.</p>}
    </section>
  );
}
