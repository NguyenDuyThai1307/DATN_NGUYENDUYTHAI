"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type CheckoutField =
  | "receiverName"
  | "receiverPhone"
  | "province"
  | "district"
  | "ward"
  | "addressDetail";

type FieldErrors = Partial<Record<CheckoutField, string>>;

const checkoutFields: CheckoutField[] = [
  "receiverName",
  "receiverPhone",
  "province",
  "district",
  "ward",
  "addressDetail",
];

function getFormValue(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function validateCheckoutForm(values: Record<CheckoutField, string>) {
  const errors: FieldErrors = {};

  if (values.receiverName.length < 2) {
    errors.receiverName = "Vui long nhap ho ten nguoi nhan.";
  }

  if (values.receiverPhone.length < 8) {
    errors.receiverPhone = "So dien thoai phai co it nhat 8 ky tu.";
  }

  if (!values.province) {
    errors.province = "Vui long nhap tinh/thanh.";
  }

  if (!values.district) {
    errors.district = "Vui long nhap quan/huyen.";
  }

  if (!values.ward) {
    errors.ward = "Vui long nhap phuong/xa.";
  }

  if (values.addressDetail.length < 5) {
    errors.addressDetail = "Dia chi chi tiet phai co it nhat 5 ky tu.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export function CheckoutForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);

    const values = {
      receiverName: getFormValue(formData, "receiverName"),
      receiverPhone: getFormValue(formData, "receiverPhone"),
      province: getFormValue(formData, "province"),
      district: getFormValue(formData, "district"),
      ward: getFormValue(formData, "ward"),
      addressDetail: getFormValue(formData, "addressDetail"),
    };

    const nextFieldErrors = validateCheckoutForm(values);

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          note: getFormValue(formData, "note"),
          paymentMethod: formData.get("paymentMethod"),
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        router.push("/login?redirect=/checkout");
        return;
      }

      if (!response.ok) {
        const serverErrors = data?.errors as
          | Partial<Record<CheckoutField, string[]>>
          | undefined;

        if (serverErrors) {
          const nextErrors: FieldErrors = {};

          for (const field of checkoutFields) {
            const message = serverErrors[field]?.[0];

            if (message) {
              nextErrors[field] = message;
            }
          }

          setFieldErrors(nextErrors);
        }

        setError(
          data?.message ??
            "Khong the tao don hang. Vui long kiem tra lai thong tin.",
        );
        return;
      }

      router.push(`/checkout/success?orderId=${data.order.id}`);
    } catch {
      setError("Khong the ket noi den server. Vui long thu lai.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5 grid gap-4">
      <div>
        <label htmlFor="receiverName" className="text-sm font-medium">
          Ho ten nguoi nhan
        </label>
        <Input
          id="receiverName"
          name="receiverName"
          className="mt-2"
          placeholder="Nguyen Van A"
          aria-invalid={Boolean(fieldErrors.receiverName)}
        />
        <FieldError message={fieldErrors.receiverName} />
      </div>

      <div>
        <label htmlFor="receiverPhone" className="text-sm font-medium">
          So dien thoai
        </label>
        <Input
          id="receiverPhone"
          name="receiverPhone"
          className="mt-2"
          placeholder="0909123456"
          aria-invalid={Boolean(fieldErrors.receiverPhone)}
        />
        <FieldError message={fieldErrors.receiverPhone} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="province" className="text-sm font-medium">
            Tinh/Thanh
          </label>
          <Input
            id="province"
            name="province"
            className="mt-2"
            placeholder="Ho Chi Minh"
            aria-invalid={Boolean(fieldErrors.province)}
          />
          <FieldError message={fieldErrors.province} />
        </div>

        <div>
          <label htmlFor="district" className="text-sm font-medium">
            Quan/Huyen
          </label>
          <Input
            id="district"
            name="district"
            className="mt-2"
            placeholder="Quan 1"
            aria-invalid={Boolean(fieldErrors.district)}
          />
          <FieldError message={fieldErrors.district} />
        </div>

        <div>
          <label htmlFor="ward" className="text-sm font-medium">
            Phuong/Xa
          </label>
          <Input
            id="ward"
            name="ward"
            className="mt-2"
            placeholder="Ben Nghe"
            aria-invalid={Boolean(fieldErrors.ward)}
          />
          <FieldError message={fieldErrors.ward} />
        </div>
      </div>

      <div>
        <label htmlFor="addressDetail" className="text-sm font-medium">
          Dia chi chi tiet
        </label>
        <Input
          id="addressDetail"
          name="addressDetail"
          className="mt-2"
          placeholder="123 Le Loi"
          aria-invalid={Boolean(fieldErrors.addressDetail)}
        />
        <FieldError message={fieldErrors.addressDetail} />
      </div>

      <div>
        <label htmlFor="note" className="text-sm font-medium">
          Ghi chu
        </label>
        <Textarea
          id="note"
          name="note"
          rows={4}
          className="mt-2"
          placeholder="Ghi chu cho don hang"
        />
      </div>

      <div>
        <label htmlFor="paymentMethod" className="text-sm font-medium">
          Phuong thuc thanh toan
        </label>
        <Select
          id="paymentMethod"
          name="paymentMethod"
          defaultValue="COD"
          className="mt-2"
        >
          <option value="COD">COD</option>
          <option value="BANK_TRANSFER">Chuyen khoan</option>
          <option value="DEMO">Demo payment</option>
        </Select>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting ? "Dang dat hang..." : "Dat hang"}
      </Button>
    </form>
  );
}