-- Preserve categoryId as the primary category while allowing products to
-- participate in multiple storefront collections.
CREATE TABLE "ProductCategory" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("productId", "categoryId"),
    CONSTRAINT "ProductCategory_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductCategory_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "Category" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProductCategory_categoryId_idx"
ON "ProductCategory"("categoryId");

INSERT OR IGNORE INTO "ProductCategory" ("productId", "categoryId")
SELECT "id", "categoryId"
FROM "Product"
WHERE "categoryId" IS NOT NULL;
