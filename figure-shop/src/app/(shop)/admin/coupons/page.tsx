import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getAdminCoupons } from "@/services/admin-coupon.service";
import { DeactivateCouponButton } from "@/components/admin/DeactivateCouponButton";

function getCouponStatus(coupon: {
  isActive: boolean;
  startsAt: Date;
  endsAt: Date;
  usageLimit: number | null;
  usedCount: number;
}) {
  const now = new Date();

  if (!coupon.isActive) {
    return {
      label: "Da tat",
      variant: "default" as const,
    };
  }

  if (coupon.startsAt > now) {
    return {
      label: "Chua bat dau",
      variant: "info" as const,
    };
  }

  if (coupon.endsAt < now) {
    return {
      label: "Da ket thuc",
      variant: "danger" as const,
    };
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return {
      label: "Da het luot",
      variant: "warning" as const,
    };
  }

  return {
    label: "Dang ap dung",
    variant: "success" as const,
  };
}

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Coupon
          </h1>
          <p className="mt-2 text-zinc-600">
            Tao va quan ly ma giam gia cho don hang.
          </p>
        </div>

        <Link
          href="/admin/coupons/create"
          className="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Tao coupon
        </Link>
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-zinc-200 bg-white">
        {coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Ma</th>
                  <th className="px-4 py-3">Gia tri</th>
                  <th className="px-4 py-3">Dieu kien</th>
                  <th className="px-4 py-3">Thoi gian</th>
                  <th className="px-4 py-3">Trang thai</th>
                  <th className="px-4 py-3 text-right">Thao tac</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);

                  return (
                    <tr key={coupon.id}>
                      <td className="px-4 py-4">
                        <p className="font-mono font-semibold text-zinc-950">
                          {coupon.code}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {coupon.name}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-medium text-red-600">
                        {coupon.type === "PERCENTAGE"
                          ? `Giam ${coupon.value}%`
                          : `Giam ${coupon.value.toLocaleString("vi-VN")} d`}
                      </td>

                      <td className="px-4 py-4 text-zinc-600">
                        <p>
                          Don tu{" "}
                          {coupon.minOrderValue.toLocaleString("vi-VN")} d
                        </p>
                        <p className="mt-1">
                          Da dung {coupon.usedCount}
                          {coupon.usageLimit !== null
                            ? `/${coupon.usageLimit}`
                            : ""}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-zinc-600">
                        <p>{coupon.startsAt.toLocaleString("vi-VN")}</p>
                        <p className="mt-1">
                          Den {coupon.endsAt.toLocaleString("vi-VN")}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <Link
                            href={`/admin/coupons/${coupon.id}/edit`}
                            className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
                            >
                            Sua
                            </Link>

                            {coupon.isActive ? (
                            <DeactivateCouponButton couponId={coupon.id} />
                            ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-zinc-600">Chua co coupon nao.</p>
          </div>
        )}
      </section>
    </main>
  );
}