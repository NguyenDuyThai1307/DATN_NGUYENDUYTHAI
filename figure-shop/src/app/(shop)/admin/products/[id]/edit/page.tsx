import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  getAdminProductById,
  getProductFormOptions,
  updateAdminProduct,
} from "@/services/admin-product.service";
import { adminProductSchema } from "@/validations/product.schema";
import { saveUploadedProductImage } from "@/services/admin-product-image.service";

type AdminEditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  const { id } = await params;

  const [product, options] = await Promise.all([
    getAdminProductById(id),
    getProductFormOptions(),
  ]);

  if (!product) {
    notFound();
  }

  async function updateProductAction(formData: FormData) {
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

    await updateAdminProduct(id, {
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
          Sửa sản phẩm
        </h1>
        <p className="mt-2 text-zinc-600">
          Cập nhật thông tin sản phẩm trong cửa hàng.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-zinc-200 bg-white p-6">
        <ProductForm
          action={updateProductAction}
          submitLabel="Lưu thay đổi"
          categories={options.categories}
          brands={options.brands}
          imageOptions={options.imageOptions}
          product={product}
        />
      </section>
    </main>
  );
}
