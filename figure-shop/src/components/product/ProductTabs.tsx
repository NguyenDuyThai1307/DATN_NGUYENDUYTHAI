"use client";

import { useState } from "react";

type ProductTabsProps = {
  description: string | null;
};

const tabs = ["Thông tin sản phẩm", "Hướng dẫn mua hàng", "Câu hỏi thường gặp"] as const;

export function ProductTabs({ description }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);

  return (
    <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4">
        {tabs.map((tab) => (
          <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)} className={`min-h-11 rounded-md px-3 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-rose-50 text-[var(--brand-strong)]" : "text-zinc-600 hover:bg-zinc-100"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="pt-5 text-sm leading-7 text-zinc-600">
        {activeTab === "Thông tin sản phẩm" ? <p>{description ?? "Thông tin chi tiết của sản phẩm đang được Figure Shop cập nhật."}</p> : null}
        {activeTab === "Hướng dẫn mua hàng" ? <p>Chọn số lượng, thêm vào giỏ hàng, kiểm tra thông tin giao nhận và hoàn tất đặt hàng tại trang thanh toán.</p> : null}
        {activeTab === "Câu hỏi thường gặp" ? <p>Bạn có thể theo dõi trạng thái đơn hàng trong Tài khoản. Sản phẩm pre-order sẽ được thông báo thời gian về hàng trước khi giao.</p> : null}
      </div>
    </section>
  );
}
