import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  createAdminProduct,
  getProductFormOptions,
} from "@/services/admin-product.service";
import { adminProductSchema } from "@/validations/product.schema";

export default async function AdminCreateProductPage() {
  const options = await getProductFormOptions();

  async function createProductAction(formData: FormData) {
    "use server";

    const parsed = adminProductSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      categoryId: formData.get("categoryId"),
      brandId: formData.get("brandId"),
      status: formData.get("status"),
      type: formData.get("type"),
      imageUrl: formData.get("imageUrl"),
      imageAlt: formData.get("imageAlt"),
    });

    if (!parsed.success) {
      throw new Error("Invalid product data");
    }

    await createAdminProduct(parsed.data);
    redirect("/admin/products");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Them san pham
        </h1>
        <p className="mt-2 text-zinc-600">
          Tao san pham moi cho cua hang.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <ProductForm
          action={createProductAction}
          submitLabel="Tao san pham"
          categories={options.categories}
          brands={options.brands}
          imageOptions={options.imageOptions}
        />
      </section>
    </main>
  );
}