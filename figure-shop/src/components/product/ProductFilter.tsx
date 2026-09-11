"use client";

import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
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
  onApplied?: () => void;
};

export function ProductFilter({
  categories,
  brands,
  values,
  action = "/products",
  layout = "toolbar",
  resetHref = action,
  showCategory = true,
  onApplied,
}: ProductFilterProps) {
  const router = useRouter();
  const prefix = useId();
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const min = String(formData.get("minPrice") ?? "");
    const max = String(formData.get("maxPrice") ?? "");
    if (min && max && Number(min) > Number(max)) {
      setError("Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu.");
      return;
    }
    setError("");
    const nextParams = new URLSearchParams();
    const fields = [
      "q",
      "categoryId",
      "brandId",
      "sort",
      "type",
      "minPrice",
      "maxPrice",
    ];

    for (const field of fields) {
      const value = String(formData.get(field) ?? "").trim();

      if (value) {
        nextParams.set(field, value);
      }
    }

    const query = nextParams.toString();

    router.push(query ? `${action}?${query}` : action);
    onApplied?.();
  }

  return (
    <form
      key={JSON.stringify(values)}
      action={action}
      method="get"
      onSubmit={handleSubmit}
      className={`grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 ${
        layout === "toolbar"
          ? "mt-8 md:grid-cols-2 lg:grid-cols-6"
          : "content-start"
      }`}
    >
      <div className={layout === "toolbar" ? "lg:col-span-2" : ""}>
        <label htmlFor={`${prefix}-q`} className="text-sm font-medium">
          Tìm sản phẩm
        </label>
        <Input
          id={`${prefix}-q`}
          name="q"
          type="search"
          defaultValue={values.query}
          placeholder="Nhân vật, anime, thương hiệu…"
          className="mt-2"
        />
      </div>

      {showCategory ? (
        <div>
          <label htmlFor={`${prefix}-categoryId`} className="text-sm font-medium">
            Danh mục
          </label>
          <Select
            id={`${prefix}-categoryId`}
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
      ) : null}

      <div>
        <label htmlFor={`${prefix}-brandId`} className="text-sm font-medium">
          Thương hiệu
        </label>
        <Select
          id={`${prefix}-brandId`}
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
        <label htmlFor={`${prefix}-sort`} className="text-sm font-medium">
          Sắp xếp
        </label>
        <Select
          id={`${prefix}-sort`}
          name="sort"
          defaultValue={values.sort ?? "newest"}
          className="mt-2"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="name_asc">Tên A-Z</option>
          <option value="name_desc">Tên Z-A</option>
          <option value="price_asc">Giá thấp đến cao</option>
          <option value="price_desc">Giá cao đến thấp</option>
        </Select>
      </div>

      <div>
        <label htmlFor={`${prefix}-type`} className="text-sm font-medium">
          Loại sản phẩm
        </label>
        <Select
          id={`${prefix}-type`}
          name="type"
          defaultValue={values.type ?? ""}
          className="mt-2"
        >
          <option value="">Tất cả loại</option>
          <option value="IN_STOCK">Có sẵn</option>
          <option value="PREORDER">Pre-order</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${prefix}-minPrice`} className="text-sm font-medium">
            Giá từ
          </label>
          <Input
            id={`${prefix}-minPrice`}
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
          <label htmlFor={`${prefix}-maxPrice`} className="text-sm font-medium">
            Đến
          </label>
          <Input
            id={`${prefix}-maxPrice`}
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

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div
        className={`flex items-center gap-2 ${
          layout === "toolbar" ? "lg:col-span-2" : ""
        }`}
      >
        <Button type="submit">Áp dụng</Button>

        <Link
          href={resetHref}
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
        >
          Đặt lại
        </Link>
      </div>
    </form>
  );
}

export function ProductFilterMobileDrawer(props: ProductFilterProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="secondary"
        className="w-full gap-2"
        onClick={() => dialogRef.current?.showModal()}
      >
        <SlidersHorizontal size={17} aria-hidden="true" />
        Bộ lọc và sắp xếp
      </Button>

      <dialog ref={dialogRef} aria-label="Bộ lọc sản phẩm" className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(88vw,360px)] max-w-none border-0 bg-white p-0 backdrop:bg-zinc-950/45">
<aside className="h-full overflow-y-auto bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[var(--brand-strong)]">
                  Bộ lọc
                </p>
                <h2 className="text-lg font-black text-zinc-950">
                  Tìm sản phẩm
                </h2>
              </div>

              <button
                type="button"
                className="grid size-9 place-items-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100"
                onClick={() => dialogRef.current?.close()}
                aria-label="Đóng bộ lọc"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <ProductFilter
              {...props}
              layout="sidebar"
              onApplied={() => dialogRef.current?.close()}
            />
          </aside>
        </dialog>
    </div>
  );
}
