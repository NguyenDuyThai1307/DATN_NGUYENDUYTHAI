import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

async function main() {
  const [productCount, unlinkedCount, categories] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({
      where: {
        categories: {
          none: {},
        },
      },
    }),
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            productLinks: true,
          },
        },
      },
    }),
  ]);

  console.log(`Tổng sản phẩm: ${productCount}`);
  console.log(`Sản phẩm chưa có danh mục: ${unlinkedCount}`);

  for (const category of categories) {
    const status = category._count.productLinks >= 30 ? "Đạt" : "Thiếu";
    console.log(
      `${status.padEnd(5)} | ${String(category._count.productLinks).padStart(3)} | ${category.name}`,
    );
  }
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
