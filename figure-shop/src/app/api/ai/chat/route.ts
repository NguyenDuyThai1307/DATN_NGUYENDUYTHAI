import { NextRequest, NextResponse } from "next/server";
import { consumeAiRateLimit } from "@/lib/ai-rate-limit";
import { createAiChatReply } from "@/services/ai.service";
import { aiChatRequestSchema } from "@/validations/ai.schema";

export const runtime = "nodejs";

function getClientIdentifier(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "local";
}

export async function POST(request: NextRequest) {
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

  if (!process.env.GROQ_API_KEY?.trim()) {
    return NextResponse.json(
      {
        message:
          "Trợ lý AI chưa được cấu hình. Vui lòng thêm GROQ_API_KEY vào file .env.",
      },
      { status: 503 },
    );
  }

  try {
    const result = await createAiChatReply(parsed.data);
    return NextResponse.json(result);
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
