import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type CouponFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  coupon?: {
    code: string;
    name: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    minOrderValue: number;
    maxDiscountAmount: number | null;
    usageLimit: number | null;
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

export function CouponForm({
  action,
  submitLabel,
  coupon,
}: CouponFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Ma coupon</label>
          <Input
            name="code"
            required
            defaultValue={coupon?.code}
            placeholder="SUMMER2026"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ten coupon</label>
          <Input
            name="name"
            required
            defaultValue={coupon?.name}
            placeholder="Giam gia mua he"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Kieu giam gia</label>
          <Select
            name="type"
            defaultValue={coupon?.type ?? "PERCENTAGE"}
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
            defaultValue={coupon?.value}
            placeholder="10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Don toi thieu</label>
          <Input
            name="minOrderValue"
            type="number"
            min={0}
            required
            defaultValue={coupon?.minOrderValue ?? 0}
            placeholder="500000"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Giam toi da</label>
          <Input
            name="maxDiscountAmount"
            type="number"
            min={1}
            defaultValue={coupon?.maxDiscountAmount ?? ""}
            placeholder="Bo trong neu khong gioi han"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Luot dung toi da</label>
          <Input
            name="usageLimit"
            type="number"
            min={1}
            defaultValue={coupon?.usageLimit ?? ""}
            placeholder="Bo trong neu khong gioi han"
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
            defaultValue={toDateTimeLocalValue(coupon?.startsAt)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ket thuc</label>
          <Input
            name="endsAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocalValue(coupon?.endsAt)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={coupon?.isActive ?? true}
        />
        Bat coupon ngay sau khi luu
      </label>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}