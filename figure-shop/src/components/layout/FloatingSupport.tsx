"use client";
import Link from "next/link";
import { ArrowUp, Bot, Headphones, Mail, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AIChatWidget } from "@/components/ai/AIChatWidget";

export function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return <>
    {!chatOpen && <div ref={ref} className="fixed bottom-20 right-3 z-40 md:bottom-6 md:right-5" onKeyDown={event => {
      if (event.key === "Escape") { setOpen(false); ref.current?.querySelector<HTMLButtonElement>("[aria-controls]")?.focus(); }
    }}>
      {open && <div id="support-actions" className="motion-menu mb-3 w-60 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
        <p className="px-3 py-2 text-sm font-bold">Figure Shop hỗ trợ bạn</p>
        <button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm hover:bg-rose-50" onClick={() => { setOpen(false); setChatOpen(true); }}><Bot size={19} />Tư vấn sản phẩm với AI</button>
        <Link href="/contact" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm hover:bg-rose-50"><Mail size={19} />Liên hệ cửa hàng</Link>
        <a href="#top" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm hover:bg-rose-50"><ArrowUp size={19} />Về đầu trang</a>
      </div>}
      <button aria-label={open ? "Đóng hỗ trợ" : "Mở hỗ trợ và trợ lý AI"} aria-expanded={open} aria-controls="support-actions" onClick={() => setOpen(!open)} className="ml-auto grid size-12 place-items-center rounded-full border-2 border-white bg-[var(--brand-strong)] text-white shadow-lg">
        {open ? <X size={22} /> : <Headphones size={22} />}
      </button>
    </div>}
    <AIChatWidget isOpen={chatOpen} onClose={() => setChatOpen(false)} />
  </>;
}
