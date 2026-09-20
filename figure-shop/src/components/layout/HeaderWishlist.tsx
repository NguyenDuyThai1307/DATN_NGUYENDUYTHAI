"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/product/Wishlist";
export function HeaderWishlist() {
  const ids = useWishlist();
  return <Link href="/wishlist" aria-label={`Yêu thích, ${ids.length} sản phẩm`} className="relative flex min-h-11 items-center gap-2"><Heart size={23} /><span className="hidden text-xs font-bold xl:block">Yêu thích</span><span className="absolute -right-2 -top-0.5 min-w-4 rounded-full bg-[var(--brand)] px-1 text-center text-[10px] leading-4 text-white">{ids.length > 99 ? "99+" : ids.length}</span></Link>;
}
