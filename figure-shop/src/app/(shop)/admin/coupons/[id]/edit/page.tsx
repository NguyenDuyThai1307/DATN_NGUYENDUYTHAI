import { requireStaff } from "@/lib/permissions";
import { notFound, redirect } from "next/navigation";
import { CouponForm } from "@/components/admin/CouponForm";
import {
  getAdminCouponById,
  updateAdminCoupon,
} from "@/services/admin-coupon.service";
import { couponSchema } from "@/validations/coupon.schema";

type AdminEditCouponPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditCouponPage({
  params,
}: AdminEditCouponPageProps) {
  const { id } = await params;
  const coupon = await getAdminCouponById(id);

  if (!coupon) {
    notFound();
  }

  async function updateCouponAction(formData: FormData) {
    "use server";
    await requireStaff();

    const parsed = couponSchema.safeParse({
      code: formData.get("code"),
      name: formData.get("name"),
      type: formData.get("type"),
      value: formData.get("value"),
      minOrderValue: formData.get("minOrderValue"),
      maxDiscountAmount: formData.get("maxDiscountAmount"),
      usageLimit: formData.get("usageLimit"),
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
      isActive: formData.get("isActive"),
    });

    if (!parsed.success) {
      throw new Error("Dữ liệu coupon không hợp lệ");
    }

    await updateAdminCoupon(id, parsed.data);
    redirect("/admin/coupons");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Sửa coupon
        </h1>
        <p className="mt-2 text-zinc-600">
          Cập nhật giá trị, điều kiện và thời gian coupon.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <CouponForm
          action={updateCouponAction}
          submitLabel="Lưu thay đổi"
          coupon={coupon}
        />
      </section>
    </main>
  );
}