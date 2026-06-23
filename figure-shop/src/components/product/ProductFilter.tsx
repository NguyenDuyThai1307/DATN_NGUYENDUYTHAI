import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type ProductFilterProps = {
  categories: {
    id: string;
    name: string;
  }[];
  brands: {
    id: string;
    name: string;
  }[];
  values: {
    query?: string;
    categoryId?: string;
    brandId?: string;
    type?: string;
    sort?: string;
  };
};

export function ProductFilter({
  categories,
  brands,
  values,
}: ProductFilterProps) {
  return (
    <form
      action="/products"
      method="get"
      className="mt-8 grid gap-4 rounded-md border border-zinc-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-5"
    >
      <div className="lg:col-span-2">
        <label htmlFor="q" className="text-sm font-medium">
          Tim san pham
        </label>
        <Input
          id="q"
          name="q"
          type="search"
          defaultValue={values.query}
          placeholder="Ten figure hoac mo ta"
          className="mt-2"
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
        <label htmlFor="sort" className="text-sm font-medium">
          Sap xep
        </label>
        <Select
          id="sort"
          name="sort"
          defaultValue={values.sort ?? "newest"}
          className="mt-2"
        >
          <option value="newest">Moi nhat</option>
          <option value="price_asc">Gia thap den cao</option>
          <option value="price_desc">Gia cao den thap</option>
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

      <div className="flex items-end gap-2 lg:col-span-2">
        <Button type="submit">Ap dung</Button>

        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
        >
          Dat lai
        </Link>
      </div>
    </form>
  );
}