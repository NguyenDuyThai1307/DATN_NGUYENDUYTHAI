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
    minPrice?: string;
    maxPrice?: string;
  };
  action?: string;
  layout?: "toolbar" | "sidebar";
  resetHref?: string;
  showCategory?: boolean;
};

export function ProductFilter({
  categories,
  brands,
  values,
  action = "/products",
  layout = "toolbar",
  resetHref = action,
  showCategory = true,
}: ProductFilterProps) {
  return (
    <form
      action={action}
      method="get"
      className={`grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 ${
        layout === "toolbar" ? "mt-8 md:grid-cols-2 lg:grid-cols-6" : ""
      }`}
    >
      <div className={layout === "toolbar" ? "lg:col-span-2" : ""}>
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

      {showCategory ? (
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
      ) : null}

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
          <option value="oldest">Cu nhat</option>
          <option value="name_asc">Ten A-Z</option>
          <option value="name_desc">Ten Z-A</option>
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="minPrice" className="text-sm font-medium">
            Gia tu
          </label>
          <Input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            step={1000}
            defaultValue={values.minPrice}
            placeholder="0"
            className="mt-2"
          />
        </div>

        <div>
          <label htmlFor="maxPrice" className="text-sm font-medium">
            Den
          </label>
          <Input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            step={1000}
            defaultValue={values.maxPrice}
            placeholder="3000000"
            className="mt-2"
          />
        </div>
      </div>

      <div
        className={`flex items-end gap-2 ${
          layout === "toolbar" ? "lg:col-span-2" : ""
        }`}
      >
        <Button type="submit">Ap dung</Button>

        <Link
          href={resetHref}
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
        >
          Dat lai
        </Link>
      </div>
    </form>
  );
}
