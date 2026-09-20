import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function getSessionUser(token: string) {
  const payload = await verifyJwt(token);
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: {
    id: true, email: true, name: true, phone: true, role: true, createdAt: true,
    isActive: true, sessionVersion: true,
  } });
  if (!user?.isActive || user.sessionVersion !== (payload.sessionVersion ?? 0)) return null;
  return user;
}
