import { redirect } from "next/navigation";
import { CouponForm } from "@/components/admin/CouponForm";
import { createAdminCoupon } from "@/services/admin-coupon.service";
import { couponSchema } from "@/validations/coupon.schema";

export default function AdminCreateCouponPage() {
  async function createCouponAction(formData: FormData) {
    "use server";

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
      throw new Error("Invalid coupon data");
    }

    await createAdminCoupon(parsed.data);
    redirect("/admin/coupons");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Tao coupon
        </h1>
        <p className="mt-2 text-zinc-600">
          Tao ma giam gia de khach hang ap dung khi thanh toan.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <CouponForm
          action={createCouponAction}
          submitLabel="Tao coupon"
        />
      </section>
    </main>
  );
}