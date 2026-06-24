-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "minOrderValue" INTEGER NOT NULL DEFAULT 0,
    "maxDiscountAmount" INTEGER,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'COD',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "subtotal" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "shippingFee" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "note" TEXT,
    "couponId" TEXT,
    "couponCode" TEXT,
    "couponDiscountAmount" INTEGER NOT NULL DEFAULT 0,
    "receiverName" TEXT NOT NULL,
    "receiverPhone" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "addressDetail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("addressDetail", "createdAt", "discountAmount", "district", "id", "note", "orderNumber", "paymentMethod", "paymentStatus", "province", "receiverName", "receiverPhone", "shippingFee", "status", "subtotal", "total", "updatedAt", "userId", "ward") SELECT "addressDetail", "createdAt", "discountAmount", "district", "id", "note", "orderNumber", "paymentMethod", "paymentStatus", "province", "receiverName", "receiverPhone", "shippingFee", "status", "subtotal", "total", "updatedAt", "userId", "ward" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_isActive_startsAt_endsAt_idx" ON "Coupon"("isActive", "startsAt", "endsAt");
