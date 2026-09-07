PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Promotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL DEFAULT 'PRODUCT',
    "productId" TEXT,
    "categoryId" TEXT,
    "brandId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Promotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Promotion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Promotion_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Promotion" (
    "id", "scope", "productId", "name", "type", "value",
    "startsAt", "endsAt", "isActive", "createdAt", "updatedAt"
)
SELECT
    "id", 'PRODUCT', "productId", "name", "type", "value",
    "startsAt", "endsAt", "isActive", "createdAt", "updatedAt"
FROM "Promotion";

DROP TABLE "Promotion";
ALTER TABLE "new_Promotion" RENAME TO "Promotion";

CREATE UNIQUE INDEX "Promotion_productId_key" ON "Promotion"("productId");
CREATE INDEX "Promotion_isActive_startsAt_endsAt_idx" ON "Promotion"("isActive", "startsAt", "endsAt");
CREATE INDEX "Promotion_scope_categoryId_idx" ON "Promotion"("scope", "categoryId");
CREATE INDEX "Promotion_scope_brandId_idx" ON "Promotion"("scope", "brandId");

PRAGMA foreign_keys=ON;
