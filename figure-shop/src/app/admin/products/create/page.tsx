import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getAdminProducts } from "@/services/admin-product.service";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <main>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase text-red-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">San pham</h1>
          <p className="mt-2 text-zinc-600">
            Quan ly danh sach san pham trong cua hang.
          </p>
        </div>

        <Link href="/admin/products/create">
          <Button type="button">Them san pham</Button>
        </Link>
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-zinc-200 bg-white">
        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">San pham</th>
                  <th className="px-4 py-3">Danh muc</th>
                  <th className="px-4 py-3">Thuong hieu</th>
                  <th className="px-4 py-3">Loai</th>
                  <th className="px-4 py-3">Trang thai</th>
                  <th className="px-4 py-3">Gia</th>
                  <th className="px-4 py-3">Ton kho</th>
                  <th className="px-4 py-3 text-right">Thao tac</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4">
                      <div className="font-medium text-zinc-950">
                        {product.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        /products/{product.slug}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {product.category?.name ?? "Chua co danh muc"}
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                        {product.brand?.name ?? "Chua co thuong hieu"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="info">
                        {product.type === "PREORDER" ? "Pre-order" : "Co san"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          product.status === "ACTIVE"
                            ? "success"
                            : product.status === "DRAFT"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <ProductPrice price={product.price} />
                    </td>
                    <td className="px-4 py-4 text-zinc-600">
                      {product.stock}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm font-medium text-zinc-950 hover:text-red-600"
                      >
                        Sua
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-zinc-600">Chua co san pham nao.</p>
            <Link
              href="/admin/products/create"
              className="mt-4 inline-flex text-sm font-medium text-red-600 hover:text-red-700"
            >
              Them san pham dau tien
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}