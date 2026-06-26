import { notFound, redirect } from "next/navigation";
import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import {
  getAdminBrandById,
  updateAdminBrand,
} from "@/services/admin-brand.service";
import { taxonomySchema } from "@/validations/taxonomy.schema";

type AdminEditBrandPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditBrandPage({
  params,
}: AdminEditBrandPageProps) {
  const { id } = await params;
  const brand = await getAdminBrandById(id);

  if (!brand) {
    notFound();
  }

  async function updateBrandAction(formData: FormData) {
    "use server";

    const parsed = taxonomySchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      throw new Error("Invalid brand data");
    }

    await updateAdminBrand(id, parsed.data);
    redirect("/admin/brands");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Sua thuong hieu
        </h1>
        <p className="mt-2 text-zinc-600">
          Cap nhat thong tin thuong hieu.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <TaxonomyForm
          action={updateBrandAction}
          submitLabel="Luu thay doi"
          item={brand}
        />
      </section>
    </main>
  );
}