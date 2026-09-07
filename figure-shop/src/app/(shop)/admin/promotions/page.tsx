import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getAdminPromotions } from "@/services/admin-promotion.service";
import { DeactivatePromotionButton } from "@/components/admin/DeactivatePromotionButton";

function getPromotionStatus(promotion: {
  isActive: boolean;
  startsAt: Date;
  endsAt: Date;
}) {
  const now = new Date();

  if (!promotion.isActive) {
    return {
      label: "Đã tắt",
      variant: "default" as const,
    };
  }

  if (promotion.startsAt > now) {
    return {
      label: "Chưa bắt đầu",
      variant: "info" as const,
    };
  }

  if (promotion.endsAt < now) {
    return {
      label: "Đã kết thúc",
      variant: "danger" as const,
    };
  }

  return {
    label: "Đang áp dụng",
    variant: "success" as const,
  };
}

export default async function AdminPromotionsPage() {
  const promotions = await getAdminPromotions();

  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Khuyến mãi
          </h1>
          <p className="mt-2 text-zinc-600">
            Tạo và quản lý khuyến mãi theo sản phẩm, danh mục hoặc thương hiệu.
          </p>
        </div>

        <Link
          href="/admin/promotions/create"
          className="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Tạo khuyến mãi
        </Link>
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-zinc-200 bg-white">
        {promotions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Phạm vi áp dụng</th>
                  <th className="px-4 py-3">Khuyến mãi</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200">
                {promotions.map((promotion) => {
                  const status = getPromotionStatus(promotion);
                  const target =
                    promotion.scope === "PRODUCT"
                      ? {
                          label: "Sản phẩm",
                          name: promotion.product?.name ?? "Sản phẩm đã xóa",
                          detail: promotion.product
                            ? `${promotion.product.price.toLocaleString("vi-VN")} đ`
                            : null,
                        }
                      : promotion.scope === "CATEGORY"
                        ? {
                            label: "Danh mục",
                            name: promotion.category?.name ?? "Danh mục đã xóa",
                            detail: null,
                          }
                        : {
                            label: "Thương hiệu",
                            name: promotion.brand?.name ?? "Thương hiệu đã xóa",
                            detail: null,
                          };

                  return (
                    <tr key={promotion.id}>
                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold uppercase text-red-600">
                          {target.label}
                        </p>
                        <p className="font-medium text-zinc-950">
                          {target.name}
                        </p>
                        {target.detail ? (
                          <p className="mt-1 text-xs text-zinc-500">
                            {target.detail}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-zinc-950">
                          {promotion.name}
                        </p>
                        <p className="mt-1 text-sm text-red-600">
                          {promotion.type === "PERCENTAGE"
                            ? `Giảm ${promotion.value}%`
                            : `Giảm ${promotion.value.toLocaleString("vi-VN")} đ`}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-zinc-600">
                        <p>
                          {promotion.startsAt.toLocaleString("vi-VN")}
                        </p>
                        <p className="mt-1">
                          Đến {promotion.endsAt.toLocaleString("vi-VN")}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/promotions/${promotion.id}/edit`}
                            className="inline-flex rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
                          >
                            Sửa
                          </Link>

                          {promotion.isActive ? (
                            <DeactivatePromotionButton promotionId={promotion.id} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-zinc-600">Chưa có khuyến mãi nào.</p>
          </div>
        )}
      </section>
    </main>
  );
}
