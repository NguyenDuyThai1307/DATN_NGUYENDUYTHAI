import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { PreorderInfo } from "@/components/product/PreorderInfo";
import { notFound } from "next/navigation";
import { ProductPrice } from "@/components/product/ProductPrice";
import { getProductBySlug } from "@/services/product.service";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const firstImage = product.images[0];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/products" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
        ← Quay lai san pham
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="aspect-square rounded-md border border-zinc-200 bg-zinc-100">
          <div className="flex h-full items-center justify-center px-8 text-center text-sm font-medium text-zinc-500">
            {firstImage?.alt ?? product.name}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase text-red-600">
            {product.type === "PREORDER" ? "Pre-order" : "Co san"}
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {product.name}
          </h1>

          <div className="mt-4 text-2xl">
            <ProductPrice price={product.price} />
          </div>

          <div className="mt-5 space-y-2 text-sm text-zinc-600">
            {product.brand ? <p>Thuong hieu: {product.brand.name}</p> : null}
            {product.category ? <p>Danh muc: {product.category.name}</p> : null}
            <p>
              Tinh trang:{" "}
              {product.type === "PREORDER"
                ? "Dang nhan dat truoc"
                : `Con ${product.stock} san pham`}
            </p>
          </div>

          {product.description ? (
            <p className="mt-6 leading-7 text-zinc-700">
              {product.description}
            </p>
          ) : null}
            <PreorderInfo isPreorder={product.type === "PREORDER"} />
          <div className="mt-8 flex flex-wrap gap-3">
            <AddToCartButton productId={product.id} />

            {product.type === "PREORDER" ? (
              <button className="rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-medium transition hover:bg-zinc-100">
                Dat truoc
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}