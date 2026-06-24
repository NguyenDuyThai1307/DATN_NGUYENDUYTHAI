-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "couponId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cart_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Cart" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "Cart";
DROP TABLE "Cart";
ALTER TABLE "new_Cart" RENAME TO "Cart";
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
