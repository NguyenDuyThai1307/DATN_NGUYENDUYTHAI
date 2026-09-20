import { requireStaff } from "@/lib/permissions";
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
    await requireStaff();

    const parsed = taxonomySchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      throw new Error("Dữ liệu thương hiệu không hợp lệ");
    }

    await updateAdminBrand(id, parsed.data);
    redirect("/admin/brands");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Sửa thương hiệu
        </h1>
        <p className="mt-2 text-zinc-600">
          Cập nhật thông tin thương hiệu.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <TaxonomyForm
          action={updateBrandAction}
          submitLabel="Lưu thay đổi"
          item={brand}
        />
      </section>
    </main>
  );
}
