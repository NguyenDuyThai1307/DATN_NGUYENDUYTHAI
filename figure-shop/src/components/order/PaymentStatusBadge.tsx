import { Badge } from "@/components/ui/Badge";

type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

const labels: Record<PaymentStatus, string> = {
  UNPAID: "Chua thanh toan",
  PAID: "Da thanh toan",
  FAILED: "That bai",
  REFUNDED: "Da hoan tien",
};

const variants: Record<
  PaymentStatus,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  UNPAID: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "info",
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}