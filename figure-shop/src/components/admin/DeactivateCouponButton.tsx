"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type DeactivateCouponButtonProps = {
  couponId: string;
};

export function DeactivateCouponButton({
  couponId,
}: DeactivateCouponButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDeactivate() {
    const confirmed = window.confirm("Ban co chac muon tat coupon nay?");

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    const response = await fetch(`/api/admin/coupons/${couponId}`, {
      method: "DELETE",
    });

    setIsSubmitting(false);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={isSubmitting}
      onClick={handleDeactivate}
    >
      Tat
    </Button>
  );
}