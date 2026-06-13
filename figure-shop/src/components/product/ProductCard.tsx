
import Link from "next/link";
import { ProductPrice } from "@/components/product/ProductPrice";

type ProductCardProps = {
  product: {
    name: string;
    slug: string;
    price: number;
    type: "IN_STOCK" | "PREORDER";
    stock: number;
    brand?: {
      name: string;
    } | null;
    images: {
      url: string;
      alt: string | null;
    }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-md border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="relative aspect-square bg-zinc-100">
        <div className="flex h-full items-center justify-center bg-zinc-100 px-6 text-center text-sm font-medium text-zinc-500">
        {firstImage?.alt ?? product.name}
        </div>

        <span className="absolute left-3 top-3 rounded bg-white px-2 py-1 text-xs font-medium text-zinc-700 shadow-sm">
          {product.type === "PREORDER" ? "Pre-order" : "Co san"}
        </span>
      </div>

      <div className="space-y-2 p-4">
        {product.brand ? (
          <p className="text-xs font-medium uppercase text-zinc-500">
            {product.brand.name}
          </p>
        ) : null}

        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-950">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-3">
          <ProductPrice price={product.price} />

          <span className="text-xs text-zinc-500">
            {product.type === "PREORDER" ? "Dat truoc" : `Con ${product.stock}`}
          </span>
        </div>
      </div>
    </Link>
  );
}