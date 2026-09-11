"use client";
import { Heart } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const key = "figure-shop:wishlist";
const eventName = "wishlist-changed";
function snapshot() { try { return localStorage.getItem(key) ?? "[]"; } catch { return "[]"; } }
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(eventName, callback); };
}
function parse(raw: string): string[] {
  try { const value: unknown = JSON.parse(raw); return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string").slice(0, 500) : []; } catch { return []; }
}
export function useWishlist() { return parse(useSyncExternalStore(subscribe, snapshot, () => "[]")); }

export function WishlistButton({ productId, name }: { productId: string; name: string }) {
  const ids = useWishlist();
  const saved = ids.includes(productId);
  const [error, setError] = useState("");
  return <div className="relative z-20">
    <button type="button" aria-pressed={saved} aria-label={`${saved ? "Bỏ yêu thích" : "Yêu thích"} ${name}`} title={saved ? "Bỏ yêu thích" : "Lưu vào yêu thích"}
      className={`grid size-11 place-items-center rounded-xl border transition ${saved ? "border-rose-200 bg-rose-50 text-rose-600" : "border-zinc-200 bg-white text-zinc-500 hover:text-rose-600"}`}
      onClick={() => {
        const current = parse(snapshot());
        try { localStorage.setItem(key, JSON.stringify(current.includes(productId) ? current.filter(id => id !== productId) : [...current, productId].slice(-500))); setError(""); window.dispatchEvent(new Event(eventName)); }
        catch { setError("Trình duyệt không cho phép lưu yêu thích."); }
      }}><Heart size={19} fill={saved ? "currentColor" : "none"} aria-hidden="true" /></button>
    {error && <p role="status" className="absolute bottom-full left-0 w-40 rounded-lg bg-white p-2 text-xs text-red-600 shadow">{error}</p>}
  </div>;
}
