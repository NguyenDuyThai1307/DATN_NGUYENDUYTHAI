import { prisma } from "@/lib/prisma";
import type { AiChatResponse } from "@/types/ai";

export async function wishlistIds(userId: string) {
  const items = await prisma.wishlistItem.findMany({ where: { userId, product: { status: "ACTIVE" } }, orderBy: { createdAt: "desc" }, select: { productId: true } });
  return items.map(item => item.productId);
}

export async function saveWishlistItem(userId: string, productId: string, saved: boolean) {
  if (saved) {
    const product = await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE" }, select: { id: true } });
    if (!product) return false;
    await prisma.wishlistItem.upsert({ where: { userId_productId: { userId, productId } }, create: { userId, productId }, update: {} });
  } else {
    await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  }
  return true;
}

export function listConversations(userId: string) {
  return prisma.aiConversation.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true, updatedAt: true } });
}

export function getConversation(userId: string, id: string) {
  return prisma.aiConversation.findFirst({ where: { id, userId }, include: { messages: { orderBy: { id: "asc" } } } });
}

export async function saveChatReply(userId: string, conversationId: string | undefined, message: string, result: AiChatResponse) {
  return prisma.$transaction(async tx => {
    const conversation = conversationId
      ? await tx.aiConversation.findFirst({ where: { id: conversationId, userId } })
      : await tx.aiConversation.create({ data: { userId, title: message.slice(0, 80) } });
    if (!conversation) throw new Error("Conversation not found");
    await tx.aiMessage.create({ data: { conversationId: conversation.id, role: "user", content: message } });
    await tx.aiMessage.create({ data: { conversationId: conversation.id, role: "assistant", content: result.message, products: result.products } });
    await tx.aiConversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
    return conversation.id;
  });
}
