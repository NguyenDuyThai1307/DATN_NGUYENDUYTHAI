"use client";

import { Copy, TicketCheck } from "lucide-react";
import { useState } from "react";

type PromoCodeBoxProps = {
  code: string;
  name: string;
};

export function PromoCodeBox({ code, name }: PromoCodeBoxProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <div className="mt-5 rounded-lg border border-dashed border-rose-200 bg-rose-50 p-4">
      <div className="flex items-start gap-3">
        <TicketCheck size={21} className="mt-0.5 shrink-0 text-[var(--brand-strong)]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-zinc-900">{name}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-600">Nhap ma tai gio hang de he thong kiem tra dieu kien ap dung.</p>
          <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-rose-200 bg-white px-3 py-2">
            <code className="truncate text-sm font-bold tracking-wide text-[var(--brand-strong)]">{code}</code>
            <button type="button" onClick={copyCode} className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-zinc-700 hover:text-[var(--brand-strong)]">
              <Copy size={14} aria-hidden="true" />
              {copied ? "Da sao chep" : "Sao chep"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
