"use client";

import { useState } from "react";

type ProductTabsProps = {
  description: string | null;
};

const tabs = ["Thong tin san pham", "Huong dan mua hang", "Cau hoi thuong gap"] as const;

export function ProductTabs({ description }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);

  return (
    <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4">
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-md px-3 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-rose-50 text-[var(--brand-strong)]" : "text-zinc-600 hover:bg-zinc-100"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="pt-5 text-sm leading-7 text-zinc-600">
        {activeTab === "Thong tin san pham" ? <p>{description ?? "Thong tin chi tiet cua san pham dang duoc Figure Shop cap nhat."}</p> : null}
        {activeTab === "Huong dan mua hang" ? <p>Chon so luong, them vao gio hang, kiem tra thong tin giao nhan va hoan tat dat hang tai trang checkout.</p> : null}
        {activeTab === "Cau hoi thuong gap" ? <p>Ban co the theo doi trang thai don hang trong Tai khoan. San pham pre-order se duoc thong bao thoi gian ve hang truoc khi giao.</p> : null}
      </div>
    </section>
  );
}
