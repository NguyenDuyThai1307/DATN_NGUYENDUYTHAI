-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "merchantAccountId" TEXT NOT NULL,
    "providerReference" TEXT NOT NULL,
    "providerPaymentId" TEXT,
    "providerCreatedAt" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "status" TEXT NOT NULL DEFAULT 'CREATING',
    "activePaymentId" TEXT,
    "requestKey" TEXT NOT NULL,
    "checkoutUrl" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "lastReconciledAt" DATETIME,
    "leaseUntil" DATETIME,
    "leaseToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "providerTransactionId" TEXT,
    "amount" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "PaymentAttempt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "checkoutKey" TEXT,
    "checkoutPayloadHash" TEXT,
    "paymentExpiresAt" DATETIME,
    "reservationReleasedAt" DATETIME,
    "couponUsageReserved" BOOLEAN NOT NULL DEFAULT false,
    "isTestOrder" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_Order" ("addressDetail", "couponCode", "couponDiscountAmount", "couponId", "createdAt", "discountAmount", "district", "id", "note", "orderNumber", "paymentMethod", "paymentStatus", "province", "receiverName", "receiverPhone", "shippingFee", "status", "subtotal", "total", "updatedAt", "userId", "ward") SELECT "addressDetail", "couponCode", "couponDiscountAmount", "couponId", "createdAt", "discountAmount", "district", "id", "note", "orderNumber", "paymentMethod", "paymentStatus", "province", "receiverName", "receiverPhone", "shippingFee", "status", "subtotal", "total", "updatedAt", "userId", "ward" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_paymentExpiresAt_reservationReleasedAt_idx" ON "Order"("paymentExpiresAt", "reservationReleasedAt");
CREATE UNIQUE INDEX "Order_userId_checkoutKey_key" ON "Order"("userId", "checkoutKey");
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "productPrice" INTEGER NOT NULL,
    "originalPrice" INTEGER NOT NULL DEFAULT 0,
    "finalPrice" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("createdAt", "discountAmount", "finalPrice", "id", "orderId", "originalPrice", "productId", "productName", "productPrice", "quantity", "total") SELECT "createdAt", "discountAmount", "finalPrice", "id", "orderId", "originalPrice", "productId", "productName", "productPrice", "quantity", "total" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "transactionCode" TEXT,
    "paidAt" DATETIME,
    "environment" TEXT NOT NULL DEFAULT 'LEGACY',
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "id", "method", "orderId", "paidAt", "status", "transactionCode", "updatedAt") SELECT "amount", "createdAt", "id", "method", "orderId", "paidAt", "status", "transactionCode", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_providerReference_key" ON "PaymentAttempt"("providerReference");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_activePaymentId_key" ON "PaymentAttempt"("activePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_requestKey_key" ON "PaymentAttempt"("requestKey");

-- CreateIndex
CREATE INDEX "PaymentAttempt_status_expiresAt_idx" ON "PaymentAttempt"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "PaymentAttempt_paymentId_createdAt_idx" ON "PaymentAttempt"("paymentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_eventKey_key" ON "PaymentEvent"("eventKey");

-- Classify existing demo data without guessing whether legacy transfers were real.
UPDATE "Payment" SET "environment" = 'DEMO' WHERE "method" = 'DEMO';
