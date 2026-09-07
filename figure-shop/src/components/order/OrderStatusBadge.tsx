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
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
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
