"use client";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useAccountData } from "@/components/account/AccountDataProvider";

export function useWishlist() { return useAccountData().ids; }
export function WishlistButton({ productId, name }: { productId: string; name: string }) {
  const { ids, toggle } = useAccountData();
  const saved = ids.includes(productId);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return <div className="relative z-20">
    <button type="button" disabled={pending} aria-pressed={saved} aria-label={`${saved ? "Bỏ yêu thích" : "Yêu thích"} ${name}`} title={saved ? "Bỏ yêu thích" : "Lưu vào yêu thích"}
      className={`grid size-11 place-items-center rounded-xl border transition disabled:opacity-50 ${saved ? "border-rose-200 bg-rose-50 text-rose-600" : "border-zinc-200 bg-white text-zinc-500 hover:text-rose-600"}`}
      onClick={async () => {
        setPending(true); setError("");
        try { await toggle(productId); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể lưu yêu thích."); }
        finally { setPending(false); }
      }}><Heart size={19} fill={saved ? "currentColor" : "none"} aria-hidden="true" /></button>
    {error && <p role="status" className="absolute bottom-full left-0 w-40 rounded-lg bg-white p-2 text-xs text-red-600 shadow">{error}</p>}
  </div>;
}
