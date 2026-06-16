import { Badge } from "@/components/ui/Badge";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

const labels: Record<OrderStatus, string> = {
  PENDING: "Cho xu ly",
  CONFIRMED: "Da xac nhan",
  PROCESSING: "Dang xu ly",
  SHIPPED: "Dang giao",
  COMPLETED: "Hoan thanh",
  CANCELLED: "Da huy",
};

const variants: Record<
  OrderStatus,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}