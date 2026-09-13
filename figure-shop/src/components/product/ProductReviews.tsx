"use client";
import Link from "next/link";
import { Star } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountData } from "@/components/account/AccountDataProvider";
import type { getProductReviews } from "@/services/review.service";

type ReviewData = Awaited<ReturnType<typeof getProductReviews>>;
export function ProductReviews({ productId, slug, initial }: { productId: string; slug: string; initial: ReviewData }) {
  const { userId } = useAccountData();
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [rating, setRating] = useState(initial.ownReview?.rating ?? 5);
  const [comment, setComment] = useState(initial.ownReview?.comment ?? "");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const busy = useRef(false);
  async function load(page: number) {
    const response = await fetch(`/api/products/${productId}/reviews?page=${page}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Không tải được đánh giá. Vui lòng tải lại trang.");
    setData(await response.json());
  }
  async function change(remove: boolean) {
    if (busy.current) return;
    busy.current = true; setPending(true); setFeedback("");
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, { method: remove ? "DELETE" : "PUT", headers: { "Content-Type": "application/json", "X-Account-Id": userId ?? "guest" }, ...(remove ? {} : { body: JSON.stringify({ rating, comment }) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      if (remove) { setComment(""); setRating(5); }
      await load(1); setFeedback(result.message); router.refresh();
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Không lưu được đánh giá."); }
    finally { busy.current = false; setPending(false); }
  }
  return <section id="reviews" aria-labelledby="reviews-title" className="mt-10 scroll-mt-32 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-8">
    <h2 id="reviews-title" className="text-2xl font-bold">Đánh giá từ khách hàng</h2>
    <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr]">
      <div className="rounded-xl bg-amber-50 p-5">
        <p className="text-4xl font-bold">{data.total ? data.average.toFixed(1) : "—"}<span className="text-base font-normal text-zinc-500"> / 5</span></p>
        <p className="mt-2 text-sm text-zinc-600">{data.total} đánh giá</p>
        <div className="mt-4 space-y-2">{data.distribution.map(item => <div key={item.rating} className="flex items-center gap-2 text-xs">
          <span className="w-9">{item.rating} sao</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-amber-100"><div className="h-full bg-amber-400" style={{ width: `${data.total ? item.count / data.total * 100 : 0}%` }} /></div><span>{item.count}</span>
        </div>)}</div>
      </div>
      <div>
        {!userId ? <p className="rounded-xl bg-zinc-50 p-5 text-sm"><Link className="font-semibold text-[var(--brand-strong)] underline" href={`/login?redirect=${encodeURIComponent(`/products/${slug}#reviews`)}`}>Đăng nhập</Link> để đánh giá sản phẩm đã mua.</p> : data.eligible || data.ownReview ? <form onSubmit={event => { event.preventDefault(); void change(false); }} className="space-y-4">
          <h3 className="font-semibold">{data.ownReview ? "Đánh giá của bạn" : "Chia sẻ trải nghiệm của bạn"}</h3>
          <fieldset disabled={pending || !data.eligible}><legend className="mb-2 text-sm">Mức độ hài lòng</legend><div className="flex gap-1">{[1, 2, 3, 4, 5].map(value => <label key={value} className="relative cursor-pointer rounded-lg p-2 has-focus-visible:ring-2 has-focus-visible:ring-rose-500">
            <input type="radio" name="review-rating" value={value} checked={rating === value} onChange={() => setRating(value)} aria-label={`${value} sao`} className="sr-only" />
            <Star aria-hidden="true" size={26} className={value <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-300"} />
          </label>)}</div></fieldset>
          <label className="block text-sm">Nhận xét
            <textarea value={comment} onChange={event => setComment(event.target.value)} required minLength={10} maxLength={2000} rows={4} disabled={pending || !data.eligible} placeholder="Chia sẻ về chất lượng, độ hoàn thiện và trải nghiệm của bạn…" className="mt-2 w-full rounded-xl border border-zinc-300 p-3 disabled:bg-zinc-50" />
          </label>
          <p className="text-xs text-zinc-500">10–2.000 ký tự. Mỗi tài khoản có một đánh giá cho sản phẩm.</p>
          <div className="flex flex-wrap gap-3">
            {data.eligible && <button disabled={pending} className="rounded-xl bg-[var(--brand-strong)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Đang xử lý…" : data.ownReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}</button>}
            {data.ownReview && <button type="button" disabled={pending} onClick={() => { if (window.confirm("Xóa đánh giá của bạn cho sản phẩm này?")) void change(true); }} className="rounded-xl border border-zinc-300 px-4 py-3 text-sm disabled:opacity-50">Xóa đánh giá</button>}
          </div>
        </form> : <p className="rounded-xl bg-zinc-50 p-5 text-sm text-zinc-600">Bạn có thể đánh giá sau khi đơn hàng chứa sản phẩm này chuyển sang trạng thái Hoàn thành.</p>}
        {feedback && <p role="status" className="mt-3 text-sm text-[var(--brand-strong)]">{feedback}</p>}
      </div>
    </div>
    <div className="mt-8 divide-y divide-zinc-100">
      {!data.total && <p className="py-6 text-center text-zinc-500">Chưa có đánh giá. Hãy chia sẻ trải nghiệm sau khi nhận hàng nhé!</p>}
      {data.reviews.map(review => <article key={review.id} className="py-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{review.author}</p><time dateTime={review.createdAt} className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</time></div>
        <p className="mt-1 text-sm text-amber-600" aria-label={`${review.rating} trên 5 sao`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700">{review.comment}</p>
        {review.updatedAt !== review.createdAt && <p className="mt-1 text-xs text-zinc-400">Đã chỉnh sửa</p>}
      </article>)}
    </div>
    {data.pages > 1 && <nav aria-label="Phân trang đánh giá" className="mt-4 flex items-center justify-center gap-4">{[-1, 1].map(direction => <button key={direction} disabled={pending || (direction < 0 ? data.page === 1 : data.page === data.pages)} onClick={async () => {
      if (busy.current) return; busy.current = true; setPending(true);
      try { await load(data.page + direction); } catch (error) { setFeedback(error instanceof Error ? error.message : "Không tải được đánh giá."); }
      finally { busy.current = false; setPending(false); }
    }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">{direction < 0 ? "Trang trước" : "Trang sau"}</button>)}<span className="text-sm">{data.page}/{data.pages}</span></nav>}
  </section>;
}
