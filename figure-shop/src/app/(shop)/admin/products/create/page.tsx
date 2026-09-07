import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  createAdminProduct,
  getProductFormOptions,
} from "@/services/admin-product.service";
import { adminProductSchema } from "@/validations/product.schema";
import { saveUploadedProductImage } from "@/services/admin-product-image.service";

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
      categoryIds: formData.getAll("categoryIds"),
      brandId: formData.get("brandId"),
      status: formData.get("status"),
      type: formData.get("type"),
      imageUrl: formData.get("imageUrl"),
      imageAlt: formData.get("imageAlt"),
    });

    if (!parsed.success) {
      throw new Error("Dữ liệu sản phẩm không hợp lệ");
    }

    const uploadedImageUrl = await saveUploadedProductImage(
      formData.get("imageFile"),
    );

    await createAdminProduct({
      ...parsed.data,
      imageUrl: uploadedImageUrl ?? parsed.data.imageUrl,
    });
    redirect("/admin/products");
  }

  return (
    <main>
      <div>
        <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Thêm sản phẩm
        </h1>
        <p className="mt-2 text-zinc-600">
          Tạo sản phẩm mới cho cửa hàng.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <ProductForm
          action={createProductAction}
          submitLabel="Tạo sản phẩm"
          categories={options.categories}
          brands={options.brands}
          imageOptions={options.imageOptions}
        />
      </section>
    </main>
  );
}
