import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type ProductFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  categories: {
    id: string;
    name: string;
  }[];
  brands: {
    id: string;
    name: string;
  }[];
  imageOptions: {
    label: string;
    url: string;
  }[];
  product?: {
    name: string;
    slug: string;
    description: string | null;
    price: number;
    stock: number;
    categoryId: string | null;
    categories?: {
      categoryId: string;
    }[];
    brandId: string | null;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
    type: "IN_STOCK" | "PREORDER";
    images?: {
      url: string;
      alt: string | null;
    }[];
  } | null;
};

export function ProductForm({
  action,
  submitLabel,
  categories,
  brands,
  imageOptions,
  product,
}: ProductFormProps) {
  const firstImage = product?.images?.[0];
  const selectedCategoryIds = new Set([
    ...(product?.categoryId ? [product.categoryId] : []),
    ...(product?.categories?.map((item) => item.categoryId) ?? []),
  ]);

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Tên sản phẩm</label>
          <Input
            name="name"
            required
            defaultValue={product?.name}
            placeholder="Mô hình tỉ lệ Hatsune Miku Sakura"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input
            name="slug"
            required
            defaultValue={product?.slug}
            placeholder="miku-sakura-scale-figure"
          />
        </div>
      </div>

      <fieldset className="rounded-md border border-zinc-200 p-4">
        <legend className="px-1 text-sm font-semibold text-zinc-950">
          Danh mục áp dụng
        </legend>
        <p className="mb-3 text-xs text-zinc-500">
          Danh mục chính luôn được lưu. Chọn thêm các danh mục mà sản phẩm thực sự phù hợp.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={selectedCategoryIds.has(category.id)}
                className="size-4 accent-zinc-950"
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="text-sm font-medium">Mô tả</label>
        <Textarea
          name="description"
          required
          rows={5}
          defaultValue={product?.description ?? ""}
          placeholder="Mô tả sản phẩm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Giá</label>
          <Input
            name="price"
            required
            type="number"
            min={0}
            defaultValue={product?.price}
            placeholder="1890000"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tồn kho</label>
          <Input
            name="stock"
            required
            type="number"
            min={0}
            defaultValue={product?.stock}
            placeholder="12"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Danh mục</label>
          <Select
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? ""}
          >
            <option value="" disabled>
              Chọn danh mục
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Thương hiệu</label>
          <Select name="brandId" required defaultValue={product?.brandId ?? ""}>
            <option value="" disabled>
              Chọn thương hiệu
            </option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Trạng thái</label>
          <Select name="status" defaultValue={product?.status ?? "DRAFT"}>
            <option value="ACTIVE">Đang hiển thị</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="ARCHIVED">Đã ẩn</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Loại sản phẩm</label>
          <Select name="type" defaultValue={product?.type ?? "IN_STOCK"}>
            <option value="IN_STOCK">Có sẵn</option>
            <option value="PREORDER">Pre-order</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Ảnh đã lưu</label>
          <Select
            name="imageUrl"
            defaultValue={firstImage?.url ?? ""}
          >
            <option value="">Không chọn ảnh</option>

            {imageOptions.map((image) => (
              <option key={image.url} value={image.url}>
                {image.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Alt ảnh</label>
          <Input
            name="imageAlt"
            defaultValue={firstImage?.alt ?? ""}
            placeholder="Tên sản phẩm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Tải ảnh mới</label>
        <input
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="mt-2 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-zinc-800"
        />
        <p className="mt-2 text-xs text-zinc-500">
          JPG, PNG, WebP hoặc AVIF, tối đa 5 MB. Ảnh tải lên sẽ được ưu tiên hơn ảnh đã lưu.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
