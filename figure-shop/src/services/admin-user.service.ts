import { prisma } from "@/lib/prisma";
import { StorefrontError } from "@/lib/storefront-error";
import { adminUserQuerySchema, adminUserUpdateSchema } from "@/validations/admin-user.schema";

const userFields = { id: true, email: true, name: true, phone: true, role: true, isActive: true, sessionVersion: true, createdAt: true, updatedAt: true } as const;
export async function listAdminUsers(input: unknown) {
  const parsed = adminUserQuerySchema.safeParse(input);
  if (!parsed.success) throw new StorefrontError("Bộ lọc người dùng không hợp lệ.");
  const { q, role, status, page: requestedPage } = parsed.data;
  const where = { ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] } : {}), ...(role ? { role } : {}), ...(status ? { isActive: status === "active" } : {}) };
  const total = await prisma.user.count({ where });
  const pages = Math.max(1, Math.ceil(total / 20));
  const page = Math.min(requestedPage, pages);
  const users = await prisma.user.findMany({ where, select: { ...userFields, _count: { select: { orders: true } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * 20, take: 20 });
  return { users, total, page, pages, filters: { q, role, status } };
}
export async function getAdminUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: { ...userFields,
    _count: { select: { orders: true, reviews: true, wishlist: true } },
    orders: { take: 10, orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true, total: true, status: true, paymentStatus: true, createdAt: true } },
  } });
  if (!user) throw new StorefrontError("Không tìm thấy người dùng.", 404);
  return user;
}
export async function updateAdminUser(actorId: string, id: string, input: unknown) {
  const parsed = adminUserUpdateSchema.safeParse(input);
  if (!parsed.success) throw new StorefrontError("Vai trò hoặc trạng thái không hợp lệ.");
  return prisma.$transaction(async tx => {
    const actor = await tx.user.findUnique({ where: { id: actorId } });
    if (!actor?.isActive || actor.role !== "ADMIN") throw new StorefrontError("Chỉ quản trị viên được quản lý người dùng.", 403);
    if (actorId === id) throw new StorefrontError("Không được tự khóa hoặc thay đổi vai trò của chính mình.", 403);
    const target = await tx.user.findUnique({ where: { id } });
    if (!target) throw new StorefrontError("Không tìm thấy người dùng.", 404);
    const { role, isActive, expectedVersion } = parsed.data;
    if (target.sessionVersion !== expectedVersion) throw new StorefrontError("Tài khoản đã được cập nhật. Vui lòng tải lại trang.", 409);
    if (target.role === "ADMIN" && target.isActive && (role !== "ADMIN" || !isActive) && await tx.user.count({ where: { role: "ADMIN", isActive: true } }) <= 1) throw new StorefrontError("Phải giữ ít nhất một quản trị viên hoạt động.", 409);
    if (target.role === role && target.isActive === isActive) return tx.user.findUniqueOrThrow({ where: { id }, select: userFields });
    return tx.user.update({ where: { id }, data: { role, isActive, sessionVersion: { increment: 1 } }, select: userFields });
  });
}
