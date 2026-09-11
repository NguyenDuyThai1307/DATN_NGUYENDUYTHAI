"use client";

import Link from "next/link";

export default function ShopError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-2xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Chưa thể tải nội dung</h1><p className="mt-3 text-zinc-600">Bạn hãy thử lại sau ít phút hoặc quay về trang chủ.</p><div className="mt-6 flex justify-center gap-3"><button onClick={reset} className="rounded-xl bg-[var(--brand-strong)] px-5 py-3 font-semibold text-white">Thử lại</button><Link href="/" className="rounded-xl border border-zinc-300 px-5 py-3 font-semibold">Trang chủ</Link></div></main>;
}
