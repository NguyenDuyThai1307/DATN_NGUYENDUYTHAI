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
          Tìm sản phẩm
        </label>
        <Input
          id="query"
          name="query"
          defaultValue={values.query ?? ""}
          className="mt-2"
          placeholder="Tên hoặc slug sản phẩm"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="text-sm font-medium">
          Danh mục
        </label>
        <Select
          id="categoryId"
          name="categoryId"
          defaultValue={values.categoryId ?? ""}
          className="mt-2"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="brandId" className="text-sm font-medium">
          Thương hiệu
        </label>
        <Select
          id="brandId"
          name="brandId"
          defaultValue={values.brandId ?? ""}
          className="mt-2"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="status" className="text-sm font-medium">
          Trạng thái
        </label>
        <Select
          id="status"
          name="status"
          defaultValue={values.status ?? ""}
          className="mt-2"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hiển thị</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="ARCHIVED">Đã ẩn</option>
        </Select>
      </div>

      <div>
        <label htmlFor="type" className="text-sm font-medium">
          Loại sản phẩm
        </label>
        <Select
          id="type"
          name="type"
          defaultValue={values.type ?? ""}
          className="mt-2"
        >
          <option value="">Tất cả loại</option>
          <option value="IN_STOCK">Có sẵn</option>
          <option value="PREORDER">Pre-order</option>
        </Select>
      </div>

      <div className="flex items-end gap-3">
        <Button type="submit">Áp dụng</Button>

        <Link
          href="/admin/products"
          className="inline-flex px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
        >
          Đặt lại
        </Link>
      </div>
    </form>
  );
}
