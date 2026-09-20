"use client";

import Image from "next/image";
import Link from "next/link";
import { useAccountData } from "@/components/account/AccountDataProvider";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bot,
  LoaderCircle,
  RotateCcw,
  Send,
  ShoppingBag,
  X,
} from "lucide-react";
import type {
  AiChatMessage,
  AiChatResponse,
  AiProductReference,
} from "@/types/ai";

type UiMessage = AiChatMessage & {
  id: string;
  products?: AiProductReference[];
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const initialMessage: UiMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Chào bạn! Bạn cứ hỏi tự nhiên về mô hình nhé. Mình có thể trò chuyện về cách chọn, phân biệt các dòng mô hình, bảo quản, quà tặng hoặc tìm sản phẩm theo sở thích và ngân sách của bạn.",
};

const starterPrompts = [
  "Mới sưu tầm mô hình nên bắt đầu từ đâu?",
  "Mô hình tỉ lệ khác Nendoroid thế nào?",
  "Gợi ý quà tặng dưới 2 triệu",
];

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function ProductResult({ product }: { product: AiProductReference }) {
  const hasDiscount = product.finalPrice < product.originalPrice;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex gap-3 rounded-md border border-zinc-200 bg-white p-2.5 transition hover:border-red-200 hover:shadow-sm"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-zinc-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="64px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-zinc-400">
            <ShoppingBag size={20} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs font-semibold text-zinc-950">
          {product.name}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
          {hasDiscount ? (
            <span className="text-[11px] text-zinc-400 line-through">
              {currencyFormatter.format(product.originalPrice)}
            </span>
          ) : null}
          <span className="text-xs font-bold text-red-600">
            {currencyFormatter.format(product.finalPrice)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          {product.type === "PREORDER"
            ? "Đặt trước"
            : product.stock > 0
              ? `Còn ${product.stock} sản phẩm`
              : "Tạm hết hàng"}
        </p>
        {product.brand || product.category ? (
          <p className="mt-0.5 truncate text-[10px] text-zinc-400">
            {[product.brand, product.category].filter(Boolean).join(" / ")}
          </p>
        ) : null}
        {product.promotionLabel ? (
          <p className="mt-0.5 text-[10px] font-semibold text-red-600">
            {product.promotionLabel}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function AIChatWidget({ isOpen, onClose, embedded = false }: { isOpen: boolean; onClose?: () => void; embedded?: boolean }) {

  const [messages, setMessages] = useState<UiMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userId } = useAccountData();
  const [conversationId, setConversationId] = useState<string>();
  const [conversations, setConversations] = useState<{ id: string; title: string }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(Boolean(userId));
  const [historyError, setHistoryError] = useState("");
  const requestInFlight = useRef(false);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    async function restore() {
      try {
        const response = await fetch("/api/ai/conversations", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Không tải được lịch sử. Vui lòng tải lại trang.");
        const data = await response.json();
        setConversations(data.conversations);
        if (data.conversations[0]) {
          const detail = await fetch(`/api/ai/conversations?id=${encodeURIComponent(data.conversations[0].id)}`, { cache: "no-store", signal: controller.signal });
          if (!detail.ok) throw new Error("Không tải được cuộc trò chuyện.");
          const { conversation } = await detail.json();
          setConversationId(conversation.id); setMessages([initialMessage, ...conversation.messages]);
        }
      } catch (error) {
        if (!controller.signal.aborted) setHistoryError(error instanceof Error ? error.message : "Không tải được lịch sử.");
      } finally { if (!controller.signal.aborted) setHistoryLoading(false); }
    }
    void restore();
    return () => controller.abort();
  }, [userId]);

  async function selectConversation(id: string) {
    if (requestInFlight.current || historyLoading) return;
    if (!id) { resetConversation(); return; }
    setHistoryLoading(true); setHistoryError("");
    try {
      const response = await fetch(`/api/ai/conversations?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("History unavailable");
      const { conversation } = await response.json();
      setMessages([initialMessage, ...conversation.messages]); setConversationId(id); setInput("");
    } catch { setHistoryError("Không tải được cuộc trò chuyện. Vui lòng thử lại."); }
    finally { setHistoryLoading(false); }
  }

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, isLoading]);

  async function sendMessage(content: string) {
    const message = content.trim();

    if (!message || requestInFlight.current || historyLoading) {
      return;
    }

    requestInFlight.current = true;
    const userMessage: UiMessage = {
      id: createMessageId(),
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((item) => item.id !== initialMessage.id)
        .slice(-10)
        .map(({ role, content: historyContent }) => ({
          role,
          content: historyContent,
        }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Account-Id": userId ?? "guest",
        },
        body: JSON.stringify({ message, history: userId ? [] : history, conversationId }),
      });

      const data = (await response.json().catch(() => null)) as
        | Partial<AiChatResponse>
        | null;

      const assistantMessage: UiMessage = {
        id: createMessageId(),
        role: "assistant",
        content:
          data?.message ??
          "Mình chưa nhận được phản hồi. Bạn thử hỏi lại giúp mình nhé.",
        products: response.ok ? data?.products : undefined,
      };

      if (response.ok && data?.conversationId) {
        setConversationId(data.conversationId);
        const id = data.conversationId;
        setConversations(current => [{ id, title: current.find(item => item.id === id)?.title ?? message.slice(0, 80) }, ...current.filter(item => item.id !== id)]);
      }
      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            "Mình chưa kết nối được với dịch vụ AI. Bạn vui lòng thử lại sau nhé.",
        },
      ]);
    } finally {
      requestInFlight.current = false;
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function resetConversation() {
    if (requestInFlight.current || historyLoading) return;
    setConversationId(undefined); setHistoryError("");
    setMessages([initialMessage]);
    setInput("");
  }

  return (
    <div className={embedded ? "chat-workspace" : ""}>
      {embedded && <aside className="chat-history"><Bot size={38} className="text-blue-600" /><h1 className="mt-3 text-xl font-bold text-blue-700">AI Figure Assistant</h1><p className="mt-2 text-xs leading-5 text-zinc-500">Tìm mô hình phù hợp, so sánh và khám phá bộ sưu tập của bạn.</p><button onClick={resetConversation} disabled={isLoading || historyLoading} className="my-5 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">+ Cuộc trò chuyện mới</button><h2 className="mb-3 text-sm font-bold">Lịch sử trò chuyện</h2>{!userId && <Link href="/login?redirect=/ai" className="text-xs text-blue-600 underline">Đăng nhập để lưu lịch sử</Link>}{conversations.map(item => <button key={item.id} disabled={isLoading || historyLoading} onClick={() => void selectConversation(item.id)} className={`mb-2 block w-full rounded-lg p-3 text-left text-sm disabled:opacity-50 ${conversationId === item.id ? "bg-blue-100 font-semibold text-blue-700" : "hover:bg-blue-50"}`}>{item.title}</button>)}{userId && !conversations.length && <p className="text-xs text-zinc-500">Cuộc trò chuyện sẽ xuất hiện tại đây sau khi bạn gửi tin nhắn.</p>}</aside>}
      {isOpen ? (
        <section
          aria-label="Trợ lý mua sắm AI"
          className={`chat-panel flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white ${embedded ? "" : "fixed inset-x-3 bottom-20 z-50 h-[min(38rem,calc(100dvh-6.5rem))] shadow-2xl sm:left-auto sm:right-4 sm:w-[420px] md:bottom-6"}`}
        >
          <header className="flex h-16 shrink-0 items-center gap-3 bg-blue-600 px-4 text-white">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
              <Bot size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold">Trợ lý Figure Shop</h2>
              <p className="text-xs text-white/75">Tư vấn sản phẩm bằng AI</p>
            </div>
            <button
              type="button"
              onClick={resetConversation}
              disabled={isLoading || historyLoading}
              aria-label="Bắt đầu cuộc trò chuyện mới"
              title="Cuộc trò chuyện mới"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15"
            >
              <RotateCcw size={18} aria-hidden="true" />
            </button>
            {!embedded && <button
              type="button"
              onClick={onClose}
              aria-label="Đóng trợ lý AI"
              title="Đóng"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15"
            >
              <X size={20} aria-hidden="true" />
            </button>}
          </header>

          {userId ? <div className={embedded && !historyLoading && !historyError ? "hidden" : "border-b bg-white px-3 py-2"}>
            {!embedded && <label className="text-xs text-zinc-600">Lịch sử theo tài khoản
              <select aria-label="Chọn cuộc trò chuyện" value={conversationId ?? ""} disabled={isLoading || historyLoading} onChange={event => void selectConversation(event.target.value)} className="mt-1 w-full rounded border border-zinc-200 p-2 text-sm">
                <option value="">Cuộc trò chuyện mới</option>
                {conversations.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </label>}
            {historyLoading && <p role="status" className="text-xs">Đang tải lịch sử…</p>}
            {historyError && <p role="alert" className="text-xs text-red-600">{historyError}</p>}
          </div> : !embedded && <p className="border-b px-3 py-2 text-xs text-zinc-500"><Link href="/login" className="underline">Đăng nhập</Link> để lưu lịch sử trò chuyện theo tài khoản.</p>}

          <div className="chat-messages min-h-0 flex-1 space-y-4 overflow-y-auto bg-white p-4 sm:p-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%]"
                    : "mr-auto max-w-[92%]"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "chat-message-user rounded-xl px-4 py-3 text-sm"
                      : "chat-message-assistant rounded-xl border px-4 py-3 text-sm leading-6 text-zinc-700"
                  }
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.products?.length ? (
                  <div className="chat-products mt-2 space-y-2">
                    {message.products.map((product) => (
                      <ProductResult key={product.slug} product={product} />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {messages.length === 1 ? (
              <div className="flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            {isLoading ? (
              <div
                className="mr-auto flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-500"
                role="status"
              >
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
                Mình đang suy nghĩ và kiểm tra thông tin...
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex shrink-0 items-end gap-2 border-t border-zinc-200 bg-white p-3"
          >
            <label htmlFor="ai-chat-message" className="sr-only">
              Nội dung cần hỏi
            </label>
            <textarea
              id="ai-chat-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              maxLength={800}
              rows={1}
              placeholder="Hỏi tự do về mô hình hoặc sản phẩm..."
              disabled={isLoading || historyLoading}
              className="max-h-24 min-h-10 flex-1 resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 disabled:bg-zinc-100"
            />
            <button
              type="submit"
              disabled={isLoading || historyLoading || !input.trim()}
              aria-label="Gửi tin nhắn"
              title="Gửi"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-zinc-950 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
