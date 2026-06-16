import Link from "next/link";
import { ProductPrice } from "@/components/product/ProductPrice";

type CartItemProps = {
  item: {
    id: string;
    quantity: number;
    product: {
      name: string;
      slug: string;
      price: number;
      brand?: {
        name: string;
      } | null;
      images: {
        alt: string | null;
      }[];
    };
  };
};

export function CartItem({ item }: CartItemProps) {
  return (
    <div className="grid gap-4 rounded-md border border-zinc-200 bg-white p-4 sm:grid-cols-[120px_1fr]">
      <div className="flex aspect-square items-center justify-center rounded bg-zinc-100 px-4 text-center text-xs font-medium text-zinc-500">
        {item.product.images[0]?.alt ?? item.product.name}
      </div>

      <div className="flex flex-col justify-between gap-4">
        <div>
          {item.product.brand ? (
            <p className="text-xs font-medium uppercase text-zinc-500">
              {item.product.brand.name}
            </p>
          ) : null}

          <Link
            href={`/products/${item.product.slug}`}
            className="mt-1 block font-semibold hover:text-red-600"
          >
            {item.product.name}
          </Link>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-zinc-600">So luong: {item.quantity}</div>
          <ProductPrice price={item.product.price * item.quantity} />
        </div>
      </div>
    </div>
  );
}