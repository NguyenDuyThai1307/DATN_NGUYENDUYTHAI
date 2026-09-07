import { Badge } from "@/components/ui/Badge";

type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

const labels: Record<PaymentStatus, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
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
