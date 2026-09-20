"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
export function UserAccessEditor({ user, self }: { user: { id: string; role: "CUSTOMER" | "STAFF" | "ADMIN"; isActive: boolean; sessionVersion: number }; self: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState(user.role);
  const [active, setActive] = useState(user.isActive);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const busy = useRef(false);
  return <form className="mt-6 space-y-4 rounded-2xl border bg-white p-5" onSubmit={async event => {
    event.preventDefault();
    if (busy.current || self) return;
    if (!window.confirm(`Đổi vai trò thành ${role}, trạng thái ${active ? "hoạt động" : "bị khóa"}? Người dùng sẽ cần đăng nhập lại.`)) return;
    busy.current = true; setPending(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role, isActive: active, expectedVersion: user.sessionVersion }) });
      const data = await response.json();
      setMessage(data.message ?? "Không thể cập nhật.");
      if (response.ok) router.refresh();
    } catch { setMessage("Không kết nối được máy chủ. Vui lòng thử lại."); }
    finally { busy.current = false; setPending(false); }
  }}>
    <h2 className="text-lg font-bold">Vai trò và trạng thái tài khoản</h2>
    <p className="text-sm text-zinc-500">Khóa tài khoản ngăn đăng nhập và thu hồi phiên cũ. Dữ liệu đơn hàng vẫn được giữ nguyên. Thay đổi vai trò cũng yêu cầu đăng nhập lại.</p>
    {self && <p className="text-sm text-amber-800">Đây là tài khoản đang đăng nhập. Bạn không thể tự đổi vai trò hoặc khóa tài khoản của mình.</p>}
    <fieldset disabled={pending || self} className="flex flex-wrap gap-5 disabled:opacity-60">
      <label className="text-sm">Vai trò<select value={role} onChange={event => setRole(event.target.value as typeof role)} className="mt-2 block rounded-lg border p-3"><option value="CUSTOMER">Khách hàng (CUSTOMER)</option><option value="STAFF">Nhân viên (STAFF)</option><option value="ADMIN">Quản trị viên (ADMIN)</option></select></label>
      <label className="text-sm">Trạng thái<select value={String(active)} onChange={event => setActive(event.target.value === "true")} className="mt-2 block rounded-lg border p-3"><option value="true">Hoạt động</option><option value="false">Bị khóa</option></select></label>
    </fieldset>
    <button disabled={pending || self || (role === user.role && active === user.isActive)} className="rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{pending ? "Đang lưu…" : "Lưu thay đổi"}</button>
    {message && <p role="status" className="text-sm text-rose-700">{message}</p>}
  </form>;
}
