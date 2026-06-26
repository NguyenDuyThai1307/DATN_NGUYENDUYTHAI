import { notFound, redirect } from "next/navigation";
import { PromotionForm } from "@/components/admin/PromotionForm";
import {
  getAdminPromotionById,
  getProductsForPromotionForm,
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

  const products = await getProductsForPromotionForm(promotion.productId);

  async function updatePromotionAction(formData: FormData) {
    "use server";

    const parsed = promotionSchema.safeParse({
      productId: formData.get("productId"),
      name: formData.get("name"),
      type: formData.get("type"),
      value: formData.get("value"),
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
      isActive: formData.get("isActive"),
    });

    if (!parsed.success) {
      throw new Error("Invalid promotion data");
    }

    await updateAdminPromotion(id, parsed.data);
    redirect("/admin/promotions");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Sua khuyen mai
        </h1>
        <p className="mt-2 text-zinc-600">
          Cap nhat gia tri, thoi gian va trang thai khuyen mai.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <PromotionForm
          action={updatePromotionAction}
          submitLabel="Luu thay doi"
          products={products}
          promotion={promotion}
        />
      </section>
    </main>
  );
}