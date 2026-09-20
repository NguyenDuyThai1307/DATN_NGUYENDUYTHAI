import { requireStaff } from "@/lib/permissions";
import { getAdminRevenueReport } from "@/services/admin-revenue.service";
import { RevenueOverview } from "@/components/admin/RevenueOverview";
export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await requireStaff();
  const { period } = await searchParams;
  const days = period === "7" ? 7 : period === "90" ? 90 : 30;
  const report = await getAdminRevenueReport(days);
  return <main><h1 className="text-3xl font-bold">Báo cáo doanh thu</h1><p className="mt-2 text-sm text-zinc-500">Tổng hợp nội bộ theo 7, 30 hoặc 90 ngày, so sánh kỳ trước và phân tích theo phương thức thanh toán.</p><RevenueOverview report={report} basePath="/admin/reports" /></main>;
}
