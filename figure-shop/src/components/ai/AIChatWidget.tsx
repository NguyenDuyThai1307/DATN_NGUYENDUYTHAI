"use client";

import Image from "next/image";
import Link from "next/link";
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

export function AIChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {

  const [messages, setMessages] = useState<UiMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, isLoading]);

  async function sendMessage(content: string) {
    const message = content.trim();

    if (!message || isLoading) {
      return;
    }

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
        },
        body: JSON.stringify({ message, history }),
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
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function resetConversation() {
    setMessages([initialMessage]);
    setInput("");
  }

  return (
    <>
      {isOpen ? (
        <section
          aria-label="Trợ lý mua sắm AI"
          className="fixed inset-x-3 bottom-20 z-50 flex h-[min(36rem,calc(100dvh-6.5rem))] flex-col overflow-hidden rounded-md border border-zinc-200 bg-white shadow-2xl sm:left-auto sm:right-4 sm:w-[400px] md:bottom-6"
        >
          <header className="flex h-16 shrink-0 items-center gap-3 bg-[var(--brand-strong)] px-4 text-white">
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
              aria-label="Bắt đầu cuộc trò chuyện mới"
              title="Cuộc trò chuyện mới"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15"
            >
              <RotateCcw size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng trợ lý AI"
              title="Đóng"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-50 p-4">
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
                      ? "rounded-md bg-zinc-950 px-3 py-2.5 text-sm text-white"
                      : "rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm leading-6 text-zinc-700"
                  }
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.products?.length ? (
                  <div className="mt-2 space-y-2">
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
              disabled={isLoading}
              className="max-h-24 min-h-10 flex-1 resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 disabled:bg-zinc-100"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Gửi tin nhắn"
              title="Gửi"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-zinc-950 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
