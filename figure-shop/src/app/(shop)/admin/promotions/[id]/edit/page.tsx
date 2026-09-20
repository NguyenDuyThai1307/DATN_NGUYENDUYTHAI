import { requireStaff } from "@/lib/permissions";
import { notFound, redirect } from "next/navigation";
import { PromotionForm } from "@/components/admin/PromotionForm";
import {
  getAdminPromotionById,
  getPromotionFormOptions,
  updateAdminPromotion,
} from "@/services/admin-promotion.service";
import { promotionSchema } from "@/validations/promotion.schema";

type AdminEditPromotionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditPromotionPage({
  params,
}: AdminEditPromotionPageProps) {
  const { id } = await params;
  const promotion = await getAdminPromotionById(id);

  if (!promotion) {
    notFound();
  }

  const { products, categories, brands } = await getPromotionFormOptions(
    promotion.productId ?? undefined,
  );

  async function updatePromotionAction(formData: FormData) {
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

    await updateAdminPromotion(id, parsed.data);
    redirect("/admin/promotions");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Sửa khuyến mãi
        </h1>
        <p className="mt-2 text-zinc-600">
          Cập nhật giá trị, thời gian và trạng thái khuyến mãi.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <PromotionForm
          action={updatePromotionAction}
          submitLabel="Lưu thay đổi"
          products={products}
          categories={categories}
          brands={brands}
          promotion={promotion}
        />
      </section>
    </main>
  );
}
