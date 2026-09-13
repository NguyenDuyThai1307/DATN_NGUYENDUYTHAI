"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const guestKey = "figure-shop:wishlist";
function guestIds(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(guestKey) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string").slice(-500) : [];
  } catch { return []; }
}
const AccountContext = createContext<{ userId: string | null; ids: string[]; toggle: (id: string) => Promise<void> } | null>(null);
export function AccountDataProvider({ userId, initialIds, children }: { userId: string | null; initialIds: string[]; children: ReactNode }) {
  const [ids, setIds] = useState(initialIds);
  const currentIds = useRef(initialIds);
  const queue = useRef(Promise.resolve());
  function update(value: string[]) { currentIds.current = value; setIds(value); }
  useEffect(() => {
    const controller = new AbortController();
    const sync = async () => {
      try {
        const auth = await fetch("/api/auth/me", { cache: "no-store", signal: controller.signal });
        if (!auth.ok && auth.status !== 401) return;
        const actualId = auth.ok ? (await auth.json()).user.id : null;
        if (actualId !== userId) { window.location.reload(); return; }
        if (!userId) { update(guestIds()); return; }
        const response = await fetch("/api/wishlist", { cache: "no-store", signal: controller.signal });
        if (response.ok) update((await response.json()).ids);
        else if (response.status === 401) update([]);
      } catch { /* Keep confirmed data on network failure. */ }
    };
    void sync();
    window.addEventListener("focus", sync); window.addEventListener("storage", sync);
    return () => { controller.abort(); window.removeEventListener("focus", sync); window.removeEventListener("storage", sync); };
  }, [userId]);
  function toggle(id: string) {
    const operation = queue.current.then(async () => {
      if (!userId) {
        const previous = guestIds();
        const next = previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id].slice(-500);
        localStorage.setItem(guestKey, JSON.stringify(next)); update(next); return;
      }
      const response = await fetch("/api/wishlist", { method: "PUT", headers: { "Content-Type": "application/json", "X-Account-Id": userId }, body: JSON.stringify({ productId: id, saved: !currentIds.current.includes(id) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Không thể lưu yêu thích.");
      update(data.ids);
    });
    queue.current = operation.catch(() => {});
    return operation;
  }
  return <AccountContext.Provider value={{ userId, ids, toggle }}>{children}</AccountContext.Provider>;
}
export function useAccountData() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("AccountDataProvider is required");
  return context;
}
