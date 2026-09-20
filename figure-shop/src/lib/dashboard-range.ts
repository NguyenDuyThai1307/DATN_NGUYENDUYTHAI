const DAY = 86_400_000;
const OFFSET = 7 * 3_600_000;

export type DashboardRangeInput = { start?: string; end?: string; period?: string };
const dateKey = (date: Date) => new Date(date.getTime() + OFFSET).toISOString().slice(0, 10);

function parseDate(value?: string) {
  if (!value || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00+07:00`);
  return Number.isFinite(date.getTime()) && dateKey(date) === value ? date : null;
}

export function dashboardRange(input: DashboardRangeInput = {}, now = new Date()) {
  const today = dateKey(now);
  let start = parseDate(`${today.slice(0, 7)}-01`)!;
  let last = parseDate(today)!;
  let error: string | null = null;
  if (input.start || input.end) {
    const from = parseDate(input.start), to = parseDate(input.end);
    if (!from || !to || from > to || (to.getTime() - from.getTime()) / DAY >= 366) {
      error = "Khoảng ngày không hợp lệ. Chọn ngày bắt đầu trước ngày kết thúc, tối đa 366 ngày. Đang hiển thị tháng này.";
    } else { start = from; last = to; }
  } else if (["7", "30", "90"].includes(input.period ?? "")) {
    start = new Date(last.getTime() - (Number(input.period) - 1) * DAY);
  }
  const end = new Date(last.getTime() + DAY);
  const days = Math.round((end.getTime() - start.getTime()) / DAY);
  return { start, end, previousStart: new Date(start.getTime() - days * DAY), days, from: dateKey(start), to: dateKey(last), error };
}

export function percentageChange(current: number, previous: number) {
  return previous > 0 ? (current - previous) / previous * 100 : null;
}
