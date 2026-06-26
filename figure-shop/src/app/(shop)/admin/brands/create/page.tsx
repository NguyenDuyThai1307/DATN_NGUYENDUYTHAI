import { redirect } from "next/navigation";
import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import { createAdminBrand } from "@/services/admin-brand.service";
import { taxonomySchema } from "@/validations/taxonomy.schema";

export default function AdminCreateBrandPage() {
  async function createBrandAction(formData: FormData) {
    "use server";

    const parsed = taxonomySchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      throw new Error("Invalid brand data");
    }

    await createAdminBrand(parsed.data);
    redirect("/admin/brands");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Them thuong hieu
        </h1>
        <p className="mt-2 text-zinc-600">
          Tao thuong hieu moi cho san pham.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <TaxonomyForm
          action={createBrandAction}
          submitLabel="Them thuong hieu"
        />
      </section>
    </main>
  );
}