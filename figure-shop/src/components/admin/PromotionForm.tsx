"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type PromotionFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  products: {
    id: string;
    name: string;
    price: number;
  }[];
  categories: {
    id: string;
    name: string;
  }[];
  brands: {
    id: string;
    name: string;
  }[];
  promotion?: {
    scope: "PRODUCT" | "CATEGORY" | "BRAND";
    productId: string | null;
    categoryId: string | null;
    brandId: string | null;
    name: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
  } | null;
};

function toDateTimeLocalValue(date: Date | undefined) {
  if (!date) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

export function PromotionForm({
  action,
  submitLabel,
  products,
  categories,
  brands,
  promotion,
}: PromotionFormProps) {
  const [scope, setScope] = useState<"PRODUCT" | "CATEGORY" | "BRAND">(
    promotion?.scope ?? "PRODUCT",
  );

  return (
    <form action={action} className="grid gap-5">
      <div>
        <label className="text-sm font-medium">Phạm vi áp dụng</label>
        <Select
          name="scope"
          value={scope}
          onChange={(event) =>
            setScope(event.target.value as "PRODUCT" | "CATEGORY" | "BRAND")
          }
        >
          <option value="PRODUCT">Một sản phẩm</option>
          <option value="CATEGORY">Toàn bộ danh mục</option>
          <option value="BRAND">Toàn bộ thương hiệu</option>
        </Select>
      </div>

      {scope === "PRODUCT" ? (
        <div>
          <label className="text-sm font-medium">Sản phẩm áp dụng</label>
          <Select
            name="productId"
            required
            defaultValue={promotion?.productId ?? ""}
          >
            <option value="" disabled>
              Chọn sản phẩm
            </option>

            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.price.toLocaleString("vi-VN")} đ
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {scope === "CATEGORY" ? (
        <div>
          <label className="text-sm font-medium">Danh mục áp dụng</label>
          <Select
            name="categoryId"
            required
            defaultValue={promotion?.categoryId ?? ""}
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
      ) : null}

      {scope === "BRAND" ? (
        <div>
          <label className="text-sm font-medium">Thương hiệu áp dụng</label>
          <Select
            name="brandId"
            required
            defaultValue={promotion?.brandId ?? ""}
          >
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
      ) : null}

      <div>
        <label className="text-sm font-medium">Tên khuyến mãi</label>
        <Input
          name="name"
          required
          defaultValue={promotion?.name}
          placeholder="Giảm giá mùa hè"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Kiểu giảm giá</label>
          <Select
            name="type"
            defaultValue={promotion?.type ?? "PERCENTAGE"}
          >
            <option value="PERCENTAGE">Giảm theo phần trăm</option>
            <option value="FIXED_AMOUNT">Giảm số tiền cố định</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Giá trị giảm</label>
          <Input
            name="value"
            type="number"
            min={1}
            required
            defaultValue={promotion?.value}
            placeholder="15"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Bắt đầu</label>
          <Input
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocalValue(promotion?.startsAt)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Kết thúc</label>
          <Input
            name="endsAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocalValue(promotion?.endsAt)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={promotion?.isActive ?? true}
        />
        Bật khuyến mãi ngay sau khi lưu
      </label>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
