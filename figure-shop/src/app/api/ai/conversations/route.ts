import { getCurrentUser } from "@/lib/auth";
import { getConversation, listConversations } from "@/services/account-data.service";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  const headers = { "Cache-Control": "private, no-store" };
  if (!id) return Response.json({ conversations: await listConversations(user.id) }, { headers });
  const conversation = await getConversation(user.id, id);
  if (!conversation) return Response.json({ message: "Không tìm thấy cuộc trò chuyện." }, { status: 404, headers });
  return Response.json({ conversation }, { headers });
}
