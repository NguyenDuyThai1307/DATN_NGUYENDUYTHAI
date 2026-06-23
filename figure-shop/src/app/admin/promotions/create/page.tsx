import { redirect } from "next/navigation";
import { PromotionForm } from "@/components/admin/PromotionForm";
import {
  createAdminPromotion,
  getProductsForPromotionForm,
} from "@/services/admin-promotion.service";
import { promotionSchema } from "@/validations/promotion.schema";

export default async function AdminCreatePromotionPage() {
  const products = await getProductsForPromotionForm();

  async function createPromotionAction(formData: FormData) {
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

    await createAdminPromotion(parsed.data);
    redirect("/admin/promotions");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Tao khuyen mai
        </h1>
        <p className="mt-2 text-zinc-600">
          Chon san pham va cau hinh gia tri, thoi gian ap dung.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <PromotionForm
          action={createPromotionAction}
          submitLabel="Tao khuyen mai"
          products={products}
        />
      </section>
    </main>
  );
}