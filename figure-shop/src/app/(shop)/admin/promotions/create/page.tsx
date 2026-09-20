import { requireStaff } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { PromotionForm } from "@/components/admin/PromotionForm";
import {
  createAdminPromotion,
  getPromotionFormOptions,
} from "@/services/admin-promotion.service";
import { promotionSchema } from "@/validations/promotion.schema";

export default async function AdminCreatePromotionPage() {
  const { products, categories, brands } = await getPromotionFormOptions();

  async function createPromotionAction(formData: FormData) {
    "use server";
    await requireStaff();

    const parsed = promotionSchema.safeParse({
      scope: formData.get("scope"),
      productId: formData.get("productId"),
      categoryId: formData.get("categoryId"),
      brandId: formData.get("brandId"),
      name: formData.get("name"),
      type: formData.get("type"),
      value: formData.get("value"),
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
      isActive: formData.get("isActive"),
    });

    if (!parsed.success) {
      throw new Error("Dữ liệu khuyến mãi không hợp lệ");
    }

    await createAdminPromotion(parsed.data);
    redirect("/admin/promotions");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Tạo khuyến mãi
        </h1>
        <p className="mt-2 text-zinc-600">
          Chọn sản phẩm, danh mục hoặc thương hiệu và cấu hình thời gian áp dụng.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <PromotionForm
          action={createPromotionAction}
          submitLabel="Tạo khuyến mãi"
          products={products}
          categories={categories}
          brands={brands}
        />
      </section>
    </main>
  );
}
