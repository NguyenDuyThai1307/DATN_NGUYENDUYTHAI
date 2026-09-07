"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type DeactivatePromotionButtonProps = {
  promotionId: string;
};

export function DeactivatePromotionButton({
  promotionId,
}: DeactivatePromotionButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDeactivate() {
    const confirmed = window.confirm(
      "Bạn có chắc muốn tắt khuyến mãi này?",
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    const response = await fetch(`/api/admin/promotions/${promotionId}`, {
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
      Tắt
    </Button>
  );
}
