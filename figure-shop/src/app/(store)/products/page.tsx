import { ProductCard } from "@/components/product/ProductCard";
import { getActiveProducts } from "@/services/product.service";

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase text-red-600">
          Figure Shop
        </p>
        <h1 className="text-3xl font-bold tracking-tight">San pham</h1>
        <p className="max-w-2xl text-zinc-600">
          Danh sach figure co san va san pham pre-order tai cua hang.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-md border border-zinc-200 bg-white p-8 text-center text-zinc-600">
          Chua co san pham nao.
        </div>
      )}
    </main>
  );
}