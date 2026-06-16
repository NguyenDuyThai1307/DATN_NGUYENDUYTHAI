"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function CheckoutForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverName: formData.get("receiverName"),
        receiverPhone: formData.get("receiverPhone"),
        province: formData.get("province"),
        district: formData.get("district"),
        ward: formData.get("ward"),
        addressDetail: formData.get("addressDetail"),
        note: formData.get("note"),
        paymentMethod: formData.get("paymentMethod"),
      }),
    });

    setIsSubmitting(false);

    if (response.status === 401) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!response.ok) {
      setError("Khong the tao don hang. Vui long kiem tra lai thong tin.");
      return;
    }

    const data = await response.json();
    router.push(`/account/orders/${data.order.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
      <div>
        <label className="text-sm font-medium">Ho ten nguoi nhan</label>
        <Input
          name="receiverName"
          required
          className="mt-2"
          placeholder="Nguyen Van A"
        />
      </div>

      <div>
        <label className="text-sm font-medium">So dien thoai</label>
        <Input
          name="receiverPhone"
          required
          className="mt-2"
          placeholder="0909123456"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Tinh/Thanh</label>
          <Input
            name="province"
            required
            className="mt-2"
            placeholder="Ho Chi Minh"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Quan/Huyen</label>
          <Input
            name="district"
            required
            className="mt-2"
            placeholder="Quan 1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Phuong/Xa</label>
          <Input
            name="ward"
            required
            className="mt-2"
            placeholder="Ben Nghe"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Dia chi chi tiet</label>
        <Input
          name="addressDetail"
          required
          className="mt-2"
          placeholder="123 Le Loi"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Ghi chu</label>
        <Textarea
          name="note"
          rows={4}
          className="mt-2"
          placeholder="Ghi chu cho don hang"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Phuong thuc thanh toan</label>
        <Select name="paymentMethod" defaultValue="COD" className="mt-2">
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
