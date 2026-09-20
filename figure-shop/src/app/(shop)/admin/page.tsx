import { DashboardOverview } from "@/components/admin/DashboardOverview";
import type { DashboardRangeInput } from "@/lib/dashboard-range";
import { requireStaff } from "@/lib/permissions";
import { getDashboardOverview } from "@/services/admin-dashboard.service";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<DashboardRangeInput> }) {
  const user = await requireStaff();
  const data = await getDashboardOverview(await searchParams);
  return <DashboardOverview data={data} isAdmin={user.role === "ADMIN"} />;
}
