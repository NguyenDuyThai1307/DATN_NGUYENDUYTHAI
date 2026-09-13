import assert from "node:assert/strict";
import { freshPaymentDb } from "./payment-test-db";

async function main() {
  await freshPaymentDb("account-data");
  const { prisma } = await import("../src/lib/prisma");
  const service = await import("../src/services/account-data.service");
  try {
    const a = await prisma.user.create({ data: { email: "a@test.local", passwordHash: "test" } });
    const b = await prisma.user.create({ data: { email: "b@test.local", passwordHash: "test" } });
    const product = await prisma.product.create({ data: { name: "Test", slug: "test", price: 100, status: "ACTIVE" } });
    await service.saveWishlistItem(a.id, product.id, true);
    await service.saveWishlistItem(a.id, product.id, true);
    assert.deepEqual(await service.wishlistIds(a.id), [product.id]);
    assert.deepEqual(await service.wishlistIds(b.id), []);
    await service.saveWishlistItem(b.id, product.id, false);
    assert.deepEqual(await service.wishlistIds(a.id), [product.id]);
    assert.equal(await service.saveWishlistItem(a.id, "missing", true), false);
    await prisma.product.update({ where: { id: product.id }, data: { status: "ARCHIVED" } });
    assert.deepEqual(await service.wishlistIds(a.id), []);
    const reply = { message: "Test answer", products: [] };
    const id = await service.saveChatReply(a.id, undefined, "Question one", reply);
    await service.saveChatReply(a.id, id, "Question two", reply);
    assert.equal((await service.getConversation(a.id, id))?.messages.length, 4);
    assert.equal(await service.getConversation(b.id, id), null);
    assert.deepEqual(await service.listConversations(b.id), []);
    await assert.rejects(service.saveChatReply(b.id, id, "Unauthorized append", reply));
    assert.equal((await service.getConversation(a.id, id))?.messages.length, 4);
    await service.saveChatReply(a.id, undefined, "New conversation", reply);
    assert.equal((await service.listConversations(a.id)).length, 2);
    await prisma.$disconnect();
    assert.equal((await service.getConversation(a.id, id))?.messages[1].content, "Test answer");
    await prisma.user.delete({ where: { id: a.id } });
    assert.equal(await prisma.aiMessage.count(), 0);
    assert.equal(await prisma.wishlistItem.count(), 0);
    console.log("PASS: wishlist persistence/idempotency, inactive products, account isolation, chat restoration/new conversations, unauthorized append rejected, cascade cleanup. No AI API calls.");
  } finally { await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
