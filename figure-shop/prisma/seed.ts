import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaBetterSqlite3({
  url: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminPasswordHash = await hashPassword("123456");

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const actionCategory = await prisma.category.upsert({
    where: { slug: "action-figure" },
    update: {},
    create: {
      name: "Action Figure",
      slug: "action-figure",
      description: "Mo hinh nhan vat co khop chuyen dong.",
    },
  });

  const scaleCategory = await prisma.category.upsert({
    where: { slug: "scale-figure" },
    update: {},
    create: {
      name: "Scale Figure",
      slug: "scale-figure",
      description: "Mo hinh trung bay ti le co dinh.",
    },
  });

  const bandaiBrand = await prisma.brand.upsert({
    where: { slug: "bandai" },
    update: {},
    create: {
      name: "Bandai",
      slug: "bandai",
      description: "Thuong hieu figure va model kit Nhat Ban.",
    },
  });

  const goodSmileBrand = await prisma.brand.upsert({
    where: { slug: "good-smile-company" },
    update: {},
    create: {
      name: "Good Smile Company",
      slug: "good-smile-company",
      description: "Thuong hieu noi tieng voi Nendoroid va scale figure.",
    },
  });

  await prisma.product.upsert({
  where: { slug: "luffy-gear-5-figure" },
    update: {},
    create: {
      name: "Luffy Gear 5 Figure",
      slug: "luffy-gear-5-figure",
      description: "Mo hinh Luffy Gear 5 phien ban trung bay.",
      price: 1290000,
      stock: 12,
      status: "ACTIVE",
      type: "IN_STOCK",
      categoryId: actionCategory.id,
      brandId: bandaiBrand.id,
      images: {
        create: [
          {
            url: "/images/products/luffy-gear-5.jpg",
            alt: "Luffy Gear 5 Figure",
            sortOrder: 1,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "miku-sakura-scale-figure" },
    update: {},
    create: {
      name: "Miku Sakura Scale Figure",
      slug: "miku-sakura-scale-figure",
      description: "Mo hinh Hatsune Miku Sakura dang pre-order.",
      price: 1890000,
      stock: 0,
      status: "ACTIVE",
      type: "PREORDER",
      categoryId: scaleCategory.id,
      brandId: goodSmileBrand.id,
      images: {
        create: [
          {
            url: "/images/products/miku-sakura.jpg",
            alt: "Miku Sakura Scale Figure",
            sortOrder: 1,
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
