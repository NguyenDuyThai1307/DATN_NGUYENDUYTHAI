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

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Ten san pham</label>
          <Input
            name="name"
            required
            defaultValue={product?.name}
            placeholder="Miku Sakura Scale Figure"
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

      <div>
        <label className="text-sm font-medium">Mo ta</label>
        <Textarea
          name="description"
          required
          rows={5}
          defaultValue={product?.description ?? ""}
          placeholder="Mo ta san pham"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Gia</label>
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
          <label className="text-sm font-medium">Ton kho</label>
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
          <label className="text-sm font-medium">Danh muc</label>
          <Select
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? ""}
          >
            <option value="" disabled>
              Chon danh muc
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Thuong hieu</label>
          <Select name="brandId" required defaultValue={product?.brandId ?? ""}>
            <option value="" disabled>
              Chon thuong hieu
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
          <label className="text-sm font-medium">Trang thai</label>
          <Select name="status" defaultValue={product?.status ?? "DRAFT"}>
            <option value="ACTIVE">Dang hien thi</option>
            <option value="DRAFT">Ban nhap</option>
            <option value="ARCHIVED">Da an</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Loai san pham</label>
          <Select name="type" defaultValue={product?.type ?? "IN_STOCK"}>
            <option value="IN_STOCK">Co san</option>
            <option value="PREORDER">Pre-order</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
            <label className="text-sm font-medium">Anh san pham</label>
            <Select
              name="imageUrl"
              defaultValue={firstImage?.url ?? ""}
            >
              <option value="">Khong chon anh</option>

              {imageOptions.map((image) => (
                <option key={image.url} value={image.url}>
                  {image.label}
                </option>
              ))}
            </Select>
          </div>
        <div>
          <label className="text-sm font-medium">Alt anh</label>
          <Input
            name="imageAlt"
            defaultValue={firstImage?.alt ?? ""}
            placeholder="Ten san pham"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}