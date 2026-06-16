import { ProductCard } from "@/components/product/ProductCard";
import { getActivePreorderProducts } from "@/services/preorder.service";

export default async function PreorderPage() {
  const products = await getActivePreorderProducts();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase text-red-600">
          Pre-order
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          San pham dat truoc
        </h1>
        <p className="max-w-2xl text-zinc-600">
          Cac figure dang mo dat truoc. Gia va thoi gian ve hang co the thay doi
          tuy theo nha phan phoi.
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
          Hien chua co san pham pre-order.
        </div>
      )}
    </main>
  );
}