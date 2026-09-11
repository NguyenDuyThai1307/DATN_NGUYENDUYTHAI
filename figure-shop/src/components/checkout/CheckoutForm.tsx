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
    errors.receiverName = "Vui lòng nhập họ tên người nhận.";
  }

  if (values.receiverPhone.length < 8) {
    errors.receiverPhone = "Số điện thoại phải có ít nhất 8 ký tự.";
  }

  if (!values.province) {
    errors.province = "Vui lòng nhập tỉnh/thành.";
  }

  if (!values.district) {
    errors.district = "Vui lòng nhập quận/huyện.";
  }

  if (!values.ward) {
    errors.ward = "Vui lòng nhập phường/xã.";
  }

  if (values.addressDetail.length < 5) {
    errors.addressDetail = "Địa chỉ chi tiết phải có ít nhất 5 ký tự.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export function CheckoutForm({ methods }: { methods: { value: string; label: string }[] }) {
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
      const payload = {
        ...values,
        note: getFormValue(formData, "note"),
        paymentMethod: formData.get("paymentMethod"),
      };
      const payloadText = JSON.stringify(payload);
      const stored = JSON.parse(sessionStorage.getItem("figure-checkout-request") ?? "null") as { payload: string; key: string } | null;
      const key = stored?.payload === payloadText ? stored.key : crypto.randomUUID();
      sessionStorage.setItem("figure-checkout-request", JSON.stringify({ payload: payloadText, key }));
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: payloadText,
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
            "Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin.",
        );
        return;
      }

      sessionStorage.removeItem("figure-checkout-request");
      const online = ["PAYOS", "VNPAY"].includes(data.order.paymentMethod);
      if (online && data.order.paymentStatus !== "PAID") {
        const paymentResponse = await fetch("/api/payment/requests", {
          method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
          body: JSON.stringify({ orderId: data.order.id }),
        }).catch(() => null);
        const payment = await paymentResponse?.json().catch(() => null);
        if (paymentResponse?.ok && payment?.checkoutUrl) { window.location.assign(payment.checkoutUrl); return; }
      }
      router.push(`/checkout/${online ? "payment-result" : "success"}?orderId=${data.order.id}`);
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5 grid gap-4">
      <div>
        <label htmlFor="receiverName" className="text-sm font-medium">
          Họ tên người nhận
        </label>
        <Input
          id="receiverName"
          name="receiverName"
          className="mt-2"
          placeholder="Nguyễn Văn A"
          aria-invalid={Boolean(fieldErrors.receiverName)}
        />
        <FieldError message={fieldErrors.receiverName} />
      </div>

      <div>
        <label htmlFor="receiverPhone" className="text-sm font-medium">
          Số điện thoại
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
            Tỉnh/Thành
          </label>
          <Input
            id="province"
            name="province"
            className="mt-2"
            placeholder="Hồ Chí Minh"
            aria-invalid={Boolean(fieldErrors.province)}
          />
          <FieldError message={fieldErrors.province} />
        </div>

        <div>
          <label htmlFor="district" className="text-sm font-medium">
            Quận/Hủyện
          </label>
          <Input
            id="district"
            name="district"
            className="mt-2"
            placeholder="Quận 1"
            aria-invalid={Boolean(fieldErrors.district)}
          />
          <FieldError message={fieldErrors.district} />
        </div>

        <div>
          <label htmlFor="ward" className="text-sm font-medium">
            Phường/Xã
          </label>
          <Input
            id="ward"
            name="ward"
            className="mt-2"
            placeholder="Bến Nghé"
            aria-invalid={Boolean(fieldErrors.ward)}
          />
          <FieldError message={fieldErrors.ward} />
        </div>
      </div>

      <div>
        <label htmlFor="addressDetail" className="text-sm font-medium">
          Địa chỉ chi tiết
        </label>
        <Input
          id="addressDetail"
          name="addressDetail"
          className="mt-2"
          placeholder="123 Lê Lợi"
          aria-invalid={Boolean(fieldErrors.addressDetail)}
        />
        <FieldError message={fieldErrors.addressDetail} />
      </div>

      <div>
        <label htmlFor="note" className="text-sm font-medium">
          Ghi chú
        </label>
        <Textarea
          id="note"
          name="note"
          rows={4}
          className="mt-2"
          placeholder="Ghi chú cho đơn hàng"
        />
      </div>

      <div>
        <label htmlFor="paymentMethod" className="text-sm font-medium">
          Phương thức thanh toán
        </label>
        <Select
          id="paymentMethod"
          name="paymentMethod"
          defaultValue="COD"
          className="mt-2"
        >
          {methods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
        </Select>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting ? "Đang đặt hàng..." : "Đặt hàng"}
      </Button>
    </form>
  );
}
