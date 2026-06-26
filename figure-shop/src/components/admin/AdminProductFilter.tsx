import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { AdminProductFilters } from "@/services/admin-product.service";

type AdminProductFilterProps = {
  categories: {
    id: string;
    name: string;
  }[];
  brands: {
    id: string;
    name: string;
  }[];
  values: AdminProductFilters;
};

export function AdminProductFilter({
  categories,
  brands,
  values,
}: AdminProductFilterProps) {
  return (
    <form
      action="/admin/products"
      method="get"
      className="mt-8 grid gap-4 rounded-md border border-zinc-200 bg-white p-5 md:grid-cols-2 xl:grid-cols-5"
    >
      <div className="xl:col-span-2">
        <label htmlFor="query" className="text-sm font-medium">
          Tim san pham
        </label>
        <Input
          id="query"
          name="query"
          defaultValue={values.query ?? ""}
          className="mt-2"
          placeholder="Ten hoac slug san pham"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="text-sm font-medium">
          Danh muc
        </label>
        <Select
          id="categoryId"
          name="categoryId"
          defaultValue={values.categoryId ?? ""}
          className="mt-2"
        >
          <option value="">Tat ca danh muc</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="brandId" className="text-sm font-medium">
          Thuong hieu
        </label>
        <Select
          id="brandId"
          name="brandId"
          defaultValue={values.brandId ?? ""}
          className="mt-2"
        >
          <option value="">Tat ca thuong hieu</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="status" className="text-sm font-medium">
          Trang thai
        </label>
        <Select
          id="status"
          name="status"
          defaultValue={values.status ?? ""}
          className="mt-2"
        >
          <option value="">Tat ca trang thai</option>
          <option value="ACTIVE">Dang hien thi</option>
          <option value="DRAFT">Ban nhap</option>
          <option value="ARCHIVED">Da an</option>
        </Select>
      </div>

      <div>
        <label htmlFor="type" className="text-sm font-medium">
          Loai san pham
        </label>
        <Select
          id="type"
          name="type"
          defaultValue={values.type ?? ""}
          className="mt-2"
        >
          <option value="">Tat ca loai</option>
          <option value="IN_STOCK">Co san</option>
          <option value="PREORDER">Pre-order</option>
        </Select>
      </div>

      <div className="flex items-end gap-3">
        <Button type="submit">Ap dung</Button>

        <Link
          href="/admin/products"
          className="inline-flex px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
        >
          Dat lai
        </Link>
      </div>
    </form>
  );
}