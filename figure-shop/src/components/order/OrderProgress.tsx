import { CheckCircle2, Circle, PackageCheck, Truck } from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

type OrderProgressProps = {
  status: OrderStatus;
};

const steps: Array<{
  status: Exclude<OrderStatus, "CANCELLED">;
  label: string;
  description: string;
}> = [
  {
    status: "PENDING",
    label: "Chờ xử lý",
    description: "Đơn hàng đã được ghi nhận",
  },
  {
    status: "CONFIRMED",
    label: "Đã xác nhận",
    description: "Cửa hàng đang chuẩn bị đơn",
  },
  {
    status: "PROCESSING",
    label: "Đang xử lý",
    description: "Sản phẩm đang được đóng gói",
  },
  {
    status: "SHIPPED",
    label: "Đang giao",
    description: "Đơn hàng đang trên đường giao",
  },
  {
    status: "COMPLETED",
    label: "Hoàn thành",
    description: "Đơn hàng đã hoàn tất",
  },
];

const statusOrder: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  COMPLETED: 4,
  CANCELLED: -1,
};

export function OrderProgress({ status }: OrderProgressProps) {
  if (status === "CANCELLED") {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-white text-red-600 shadow-sm">
            <Circle size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold text-red-700">Đơn hàng đã hủy</h2>
            <p className="mt-1 text-sm text-red-600">
              Đơn hàng này không còn trong quy trình xử lý.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentStep = statusOrder[status];

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <PackageCheck size={19} className="text-[var(--brand-strong)]" />
        <h2 className="font-bold text-zinc-950">Tien trinh đơn hàng</h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-5">
        {steps.map((step, index) => {
          const isDone = index <= currentStep;
          const isCurrent = index === currentStep;
          const Icon = step.status === "SHIPPED" ? Truck : CheckCircle2;

          return (
            <div key={step.status} className="relative">
              {index < steps.length - 1 ? (
                <span
                  className={`absolute left-5 top-5 hidden h-0.5 w-[calc(100%+0.75rem)] sm:block ${
                    index < currentStep ? "bg-emerald-500" : "bg-zinc-200"
                  }`}
                  aria-hidden="true"
                />
              ) : null}

              <div className="relative flex gap-3 sm:block">
                <span
                  className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border bg-white ${
                    isDone
                      ? "border-emerald-500 text-emerald-600"
                      : "border-zinc-200 text-zinc-400"
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>

                <div className="sm:mt-3">
                  <p
                    className={`text-sm font-bold ${
                      isCurrent ? "text-zinc-950" : "text-zinc-600"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
