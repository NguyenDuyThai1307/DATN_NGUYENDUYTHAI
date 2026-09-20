"use client";

import { useId, useState } from "react";

type RevenuePoint = { date: string; value: number };
const money = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

export function DashboardRevenueChart({ points }: { points: RevenuePoint[] }) {
  const [group, setGroup] = useState("day");
  const [selected, setSelected] = useState<number | null>(null);
  const gradient = useId().replaceAll(":", "");
  const grouped: RevenuePoint[] = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const key = group === "month" ? point.date.slice(0, 7) : group === "week" ? points[Math.floor(i / 7) * 7].date : point.date;
    if (grouped.at(-1)?.date === key) grouped[grouped.length - 1].value += point.value;
    else grouped.push({ date: key, value: point.value });
  }
  const peak = Math.max(1000, ...grouped.map(point => point.value));
  const magnitude = 10 ** Math.floor(Math.log10(peak));
  const ceiling = Math.ceil(peak / magnitude) * magnitude;
  const left = 75, top = 18, width = 560, height = 160, bottom = top + height;
  const x = (index: number) => left + (grouped.length === 1 ? width / 2 : index / (grouped.length - 1) * width);
  const y = (value: number) => bottom - value / ceiling * height;
  const line = grouped.map((point, index) => `${index ? "L" : "M"}${x(index)},${y(point.value)}`).join(" ");
  const area = grouped.length ? `${line} L${x(grouped.length - 1)},${bottom} L${x(0)},${bottom} Z` : "";
  const label = (date: string) => group === "month" ? `${date.slice(5, 7)}/${date.slice(0, 4)}` : `${date.slice(8, 10)}/${date.slice(5, 7)}`;
  const shown = selected === null ? null : grouped[selected];

  return <section className="dashboard-panel dashboard-revenue" aria-labelledby="dashboard-revenue-title">
    <div className="dashboard-panel-heading"><h2 id="dashboard-revenue-title">Doanh thu theo thời gian</h2><label className="dashboard-chart-select"><span className="sr-only">Gộp doanh thu</span><select value={group} onChange={event => { setGroup(event.target.value); setSelected(null); }}><option value="day">Theo ngày</option><option value="week">Theo 7 ngày</option><option value="month">Theo tháng</option></select></label></div>
    <svg viewBox="0 0 660 213" role="img" aria-label="Biểu đồ doanh thu đã thanh toán. Số liệu chi tiết trong bảng bên dưới." className="dashboard-line-chart">
      <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9ca3af" stopOpacity=".32" /><stop offset="100%" stopColor="#9ca3af" stopOpacity=".05" /></linearGradient></defs>
      {[0, 1, 2, 3, 4].map(index => <g key={index}><line x1={left} x2={left + width} y1={top + index * height / 4} y2={top + index * height / 4} stroke="#eceef2" /><text x={left - 10} y={top + index * height / 4 + 4} textAnchor="end" fontSize="10" fill="#7a818c">{Math.round(ceiling * (4 - index) / 4).toLocaleString("vi-VN")}</text></g>)}
      <path d={area} fill={`url(#${gradient})`} /><path d={line} fill="none" stroke="#8d96a3" strokeWidth="2" strokeLinejoin="round" />
      {grouped.map((point, index) => <g key={point.date}>
        <circle cx={x(index)} cy={y(point.value)} r={grouped.length > 60 ? 1.5 : 3} fill="#858e9a" />
        <circle cx={x(index)} cy={y(point.value)} r="8" fill="transparent" tabIndex={0} aria-label={`${label(point.date)}: ${money(point.value)}`} onFocus={() => setSelected(index)} onBlur={() => setSelected(null)} onMouseEnter={() => setSelected(index)} onMouseLeave={() => setSelected(null)}><title>{`${label(point.date)}: ${money(point.value)}`}</title></circle>
        {(index % Math.max(1, Math.ceil(grouped.length / 7)) === 0 || index === grouped.length - 1) && <text x={x(index)} y="201" textAnchor="middle" fontSize="10" fill="#7a818c">{label(point.date)}</text>}
      </g>)}
    </svg>
    <div className="dashboard-chart-caption" aria-live="polite">{shown ? `${label(shown.date)} · ${money(shown.value)}` : points.some(point => point.value > 0) ? "Di chuột hoặc chọn điểm trên biểu đồ để xem số tiền." : "Chưa có doanh thu đã thanh toán trong kỳ này."}</div>
    <details className="dashboard-data-table"><summary>Xem số liệu chi tiết</summary><div className="dashboard-table-scroll"><table><caption className="sr-only">Doanh thu theo kỳ đã chọn</caption><thead><tr><th>Thời gian</th><th>Doanh thu</th></tr></thead><tbody>{grouped.map(point => <tr key={point.date}><td>{label(point.date)}</td><td>{money(point.value)}</td></tr>)}</tbody></table></div></details>
  </section>;
}

export function DashboardOrderChart({ statuses }: { statuses: { label: string; count: number; color: string }[] }) {
  const total = statuses.reduce((sum, row) => sum + row.count, 0);
  const segments = statuses.map((row, index) => ({
    ...row,
    start: total ? statuses.slice(0, index).reduce((sum, item) => sum + item.count, 0) / total * 100 : 0,
    percent: total ? row.count / total * 100 : 0,
  }));
  return <section className="dashboard-panel" aria-labelledby="dashboard-status-title">
    <div className="dashboard-panel-heading"><h2 id="dashboard-status-title">Đơn hàng theo trạng thái</h2></div>
    <div className="dashboard-status-content"><svg viewBox="0 0 180 180" className="dashboard-donut" role="img" aria-label={`${total} đơn hàng trong kỳ. Chi tiết trạng thái ở danh sách bên cạnh.`}>
      <circle cx="90" cy="90" r="66" fill="none" stroke="#eef0f3" strokeWidth="32" />
      {segments.filter(row => row.count > 0).map(row => <circle key={row.label} cx="90" cy="90" r="66" fill="none" stroke={row.color} strokeWidth="32" pathLength="100" strokeDasharray={`${row.percent} ${100 - row.percent}`} strokeDashoffset={-row.start} transform="rotate(-90 90 90)"><title>{`${row.label}: ${row.count} đơn`}</title></circle>)}
      <text x="90" y="87" textAnchor="middle" fontSize="24" fontWeight="700" fill="#181c22">{total.toLocaleString("vi-VN")}</text><text x="90" y="107" textAnchor="middle" fontSize="12" fill="#727984">đơn hàng</text>
    </svg><ul className="dashboard-status-legend">{statuses.map(row => <li key={row.label}><i style={{ background: row.color }} aria-hidden="true" /><span>{row.label}</span><strong>{row.count}</strong></li>)}</ul></div>
    <p className="dashboard-footnote">Theo ngày tạo đơn; nhóm xử lý gồm chờ xác nhận, đã xác nhận và đang xử lý.</p>
  </section>;
}
