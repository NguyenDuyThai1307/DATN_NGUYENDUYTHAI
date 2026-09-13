import { NextRequest, NextResponse } from "next/server";
import { consumeAiRateLimit } from "@/lib/ai-rate-limit";
import { createAiChatReply } from "@/services/ai.service";
import { aiChatRequestSchema } from "@/validations/ai.schema";
import { getCurrentUser } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/same-origin";
import { getConversation, saveChatReply } from "@/services/account-data.service";

export const runtime = "nodejs";

function getClientIdentifier(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "local";
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ message: "Nguồn yêu cầu không hợp lệ." }, { status: 403 });
  const user = await getCurrentUser();
  if (request.headers.get("x-account-id") !== (user?.id ?? "guest")) return NextResponse.json({ message: "Phiên đăng nhập đã thay đổi. Vui lòng tải lại trang." }, { status: 409 });
  const rateLimit = consumeAiRateLimit(getClientIdentifier(request));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        message: `Bạn đang gửi hơi nhanh. Vui lòng thử lại sau ${rateLimit.retryAfterSeconds} giây nhé.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu gửi lên không phải JSON hợp lệ." },
      { status: 400 },
    );
  }

  const parsed = aiChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Nội dung tin nhắn không hợp lệ.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      {
        message:
          "Trợ lý AI chưa được cấu hình. Vui lòng thêm OPENAI_API_KEY vào file .env.",
      },
      { status: 503 },
    );
  }

  try {
    const { conversationId, message } = parsed.data;
    if (conversationId && !user) return NextResponse.json({ message: "Vui lòng đăng nhập lại." }, { status: 401 });
    const conversation = user && conversationId ? await getConversation(user.id, conversationId) : null;
    if (conversationId && !conversation) return NextResponse.json({ message: "Không tìm thấy cuộc trò chuyện." }, { status: 404 });
    const history = user ? (conversation?.messages ?? []).slice(-10).map(item => ({ role: item.role as "user" | "assistant", content: item.content })) : parsed.data.history;
    const result = await createAiChatReply({ message, history });
    const savedId = user ? await saveChatReply(user.id, conversationId, message, result) : undefined;
    return NextResponse.json({ ...result, conversationId: savedId });
  } catch (error) {
    console.error("AI chat request failed", error);

    return NextResponse.json(
      {
        message:
          "Trợ lý AI đang tạm thời gián đoạn. Bạn vui lòng thử lại sau nhé.",
      },
      { status: 502 },
    );
  }
}
