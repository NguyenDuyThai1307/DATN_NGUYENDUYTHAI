import { redirect } from "next/navigation";
import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import { createAdminCategory } from "@/services/admin-category.service";
import { taxonomySchema } from "@/validations/taxonomy.schema";

export default function AdminCreateCategoryPage() {
  async function createCategoryAction(formData: FormData) {
    "use server";

    const parsed = taxonomySchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      throw new Error("Invalid category data");
    }

    await createAdminCategory(parsed.data);
    redirect("/admin/categories");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Them danh muc
        </h1>
        <p className="mt-2 text-zinc-600">
          Tao danh muc moi de phan loai san pham.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <TaxonomyForm
          action={createCategoryAction}
          submitLabel="Them danh muc"
        />
      </section>
    </main>
  );
}