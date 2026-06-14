"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
        <input
          name="receiverName"
          required
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="Nguyen Van A"
        />
      </div>

      <div>
        <label className="text-sm font-medium">So dien thoai</label>
        <input
          name="receiverPhone"
          required
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="0909123456"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Tinh/Thanh</label>
          <input
            name="province"
            required
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="Ho Chi Minh"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Quan/Huyen</label>
          <input
            name="district"
            required
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="Quan 1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Phuong/Xa</label>
          <input
            name="ward"
            required
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="Ben Nghe"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Dia chi chi tiet</label>
        <input
          name="addressDetail"
          required
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="123 Le Loi"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Ghi chu</label>
        <textarea
          name="note"
          rows={4}
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="Ghi chu cho don hang"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Phuong thuc thanh toan</label>
        <select
          name="paymentMethod"
          defaultValue="COD"
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
        >
          <option value="COD">COD</option>
          <option value="BANK_TRANSFER">Chuyen khoan</option>
          <option value="DEMO">Demo payment</option>
        </select>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Dang dat hang..." : "Dat hang"}
      </button>
    </form>
  );
}