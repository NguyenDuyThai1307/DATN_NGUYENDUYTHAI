"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type ArchiveProductButtonProps = {
  productId: string;
};

export function ArchiveProductButton({ productId }: ArchiveProductButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleArchive() {
    const confirmed = window.confirm("Ban co chac muon an san pham nay?");

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });

    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={isSubmitting}
      onClick={handleArchive}
    >
      An
    </Button>
  );
}