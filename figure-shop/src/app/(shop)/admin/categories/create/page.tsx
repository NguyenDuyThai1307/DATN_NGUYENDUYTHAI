import { requireStaff } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import { createAdminCategory } from "@/services/admin-category.service";
import { taxonomySchema } from "@/validations/taxonomy.schema";

export default function AdminCreateCategoryPage() {
  async function createCategoryAction(formData: FormData) {
    "use server";
    await requireStaff();

    const parsed = taxonomySchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      throw new Error("Dữ liệu danh mục không hợp lệ");
    }

    await createAdminCategory(parsed.data);
    redirect("/admin/categories");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Thêm danh mục
        </h1>
        <p className="mt-2 text-zinc-600">
          Tạo danh mục mới để phân loại sản phẩm.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <TaxonomyForm
          action={createCategoryAction}
          submitLabel="Thêm danh mục"
        />
      </section>
    </main>
  );
}