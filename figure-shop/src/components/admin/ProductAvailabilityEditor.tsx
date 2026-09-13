"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ProductAvailabilityEditor({ productId, name, type, stock }: {
  productId: string; name: string; type: "IN_STOCK" | "PREORDER"; stock: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [selected, setSelected] = useState(type);
  const [quantity, setQuantity] = useState(String(stock));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  return <>
    <button type="button" className="mt-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-rose-50" onClick={() => {
      setSelected(type); setQuantity(String(stock)); setMessage(""); dialog.current?.showModal();
    }}>Đổi loại hàng</button>
    <dialog ref={dialog} aria-label={`Đổi loại hàng: ${name}`} className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border-0 bg-white p-6 shadow-xl backdrop:bg-black/40" onCancel={event => { if (pending) event.preventDefault(); }}>
      <form onSubmit={async event => {
        event.preventDefault();
        if (pending) return;
        setPending(true); setMessage("");
        try {
          const response = await fetch(`/api/admin/products/${productId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: selected, ...(selected === "IN_STOCK" ? { stock: Number(quantity) } : {}) }) });
          const data = await response.json();
          if (!response.ok) { setMessage(data.message ?? "Không thể cập nhật"); return; }
          dialog.current?.close(); router.refresh();
        } catch { setMessage("Không thể kết nối. Vui lòng thử lại."); }
        finally { setPending(false); }
      }}>
        <h2 className="text-lg font-bold">Đổi loại hàng</h2>
        <p className="mb-5 mt-1 text-sm text-zinc-600">{name}</p>
        <label className="block text-sm font-medium">Loại hàng
          <select disabled={pending} value={selected} onChange={event => setSelected(event.target.value as typeof type)} className="mt-2 h-11 w-full rounded-lg border border-zinc-300 px-3">
            <option value="PREORDER">Pre-order — Đặt trước</option><option value="IN_STOCK">In-stock — Có sẵn</option>
          </select>
        </label>
        {selected === "IN_STOCK" ? <label className="mt-4 block text-sm font-medium">Số lượng còn có thể bán
          <input disabled={pending} value={quantity} onChange={event => setQuantity(event.target.value)} type="number" required min={0} max={2147483647} step={1} className="mt-2 h-11 w-full rounded-lg border border-zinc-300 px-3" />
          <span className="mt-2 block text-xs font-normal text-zinc-500">Nhập 0 nếu đã chuyển loại nhưng hiện hết hàng. Không tính số lượng đã giữ cho đơn cũ.</span>
        </label> : <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Pre-order không kiểm tra tồn khi đặt hàng và không áp dụng khuyến mãi sản phẩm. Khuyến mãi trực tiếp sẽ được tắt.</p>}
        <p className="mt-3 text-xs text-zinc-500">Thay đổi áp dụng cho các lần đặt hàng tiếp theo; không sửa đơn hàng đã tạo.</p>
        {message && <p role="alert" className="mt-3 text-sm text-red-600">{message}</p>}
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" disabled={pending} onClick={() => dialog.current?.close()}>Hủy</Button><Button type="submit" disabled={pending}>{pending ? "Đang lưu…" : "Lưu loại hàng"}</Button></div>
      </form>
    </dialog>
  </>;
}
