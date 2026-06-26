import { notFound, redirect } from "next/navigation";
import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import {
  getAdminCategoryById,
  updateAdminCategory,
} from "@/services/admin-category.service";
import { taxonomySchema } from "@/validations/taxonomy.schema";

type AdminEditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditCategoryPage({
  params,
}: AdminEditCategoryPageProps) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) {
    notFound();
  }

  async function updateCategoryAction(formData: FormData) {
    "use server";

    const parsed = taxonomySchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      throw new Error("Invalid category data");
    }

    await updateAdminCategory(id, parsed.data);
    redirect("/admin/categories");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Sua danh muc
        </h1>
        <p className="mt-2 text-zinc-600">
          Cap nhat thong tin danh muc.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <TaxonomyForm
          action={updateCategoryAction}
          submitLabel="Luu thay doi"
          item={category}
        />
      </section>
    </main>
  );
}