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
  promotion?: {
    productId: string;
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
  promotion,
}: PromotionFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div>
        <label className="text-sm font-medium">San pham ap dung</label>
        <Select
          name="productId"
          required
          defaultValue={promotion?.productId ?? ""}
        >
          <option value="" disabled>
            Chon san pham
          </option>

          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - {product.price.toLocaleString("vi-VN")} d
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Ten khuyen mai</label>
        <Input
          name="name"
          required
          defaultValue={promotion?.name}
          placeholder="Giam gia mua he"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Kieu giam gia</label>
          <Select
            name="type"
            defaultValue={promotion?.type ?? "PERCENTAGE"}
          >
            <option value="PERCENTAGE">Giam theo phan tram</option>
            <option value="FIXED_AMOUNT">Giam so tien co dinh</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Gia tri giam</label>
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
          <label className="text-sm font-medium">Bat dau</label>
          <Input
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocalValue(promotion?.startsAt)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ket thuc</label>
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
        Bat khuyen mai ngay sau khi luu
      </label>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}