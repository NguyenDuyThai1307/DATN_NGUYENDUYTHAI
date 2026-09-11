"use client";
import Link from "next/link";
import { CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
export function CartNotification() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = () => { setVisible(true); clearTimeout(timer); timer = setTimeout(() => setVisible(false), 6000); };
    window.addEventListener("cart-added", show);
    return () => { clearTimeout(timer); window.removeEventListener("cart-added", show); };
  }, []);
  if (!visible) return null;
  return <div className="motion-menu fixed inset-x-4 top-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl">
    <CheckCircle className="shrink-0 text-emerald-600" aria-hidden="true" />
    <div><p role="status" className="text-sm font-semibold">Đã thêm sản phẩm vào giỏ</p><Link href="/cart" onClick={() => setVisible(false)} className="mt-1 inline-block text-sm font-medium text-[var(--brand-strong)] underline">Xem giỏ hàng</Link></div>
    <button type="button" onClick={() => setVisible(false)} aria-label="Đóng thông báo" className="ml-auto grid size-10 shrink-0 place-items-center rounded-lg hover:bg-zinc-100"><X size={18} /></button>
  </div>;
}
