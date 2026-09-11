"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useSyncExternalStore, type ComponentProps } from "react";
import { ProductGrid } from "./ProductGrid";
import { useWishlist } from "./Wishlist";
const subscribe = () => () => {};

export function WishlistProducts({ products }: { products: ComponentProps<typeof ProductGrid>["products"] }) {
  const ids = useWishlist();
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const selected = products.filter(product => ids.includes(product.id));
  if (!ready) return <p role="status">Đang tải danh sách yêu thích…</p>;
  return selected.length ? <ProductGrid products={selected} /> : <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center"><Heart className="mx-auto mb-4 text-rose-400" /><h2 className="font-bold">Chưa có sản phẩm yêu thích</h2><p className="my-3 text-sm text-zinc-500">Bấm biểu tượng trái tim để lưu mô hình bạn quan tâm.</p><Link href="/products" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--brand-strong)] px-5 text-sm font-semibold text-white">Khám phá sản phẩm</Link></div>;
}
