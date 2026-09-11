import { createRequire } from "node:module";
import { mkdir, readdir, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
type NativeDb = {
  exec(sql: string): void;
  prepare(sql: string): { all(): Record<string, unknown>[]; get(): Record<string, unknown> };
  backup(path: string): Promise<unknown>;
  close(): void;
};
export const Database = createRequire(import.meta.url)("better-sqlite3") as new (path: string) => NativeDb;
export async function freshPaymentDb(name: string) {
  const directory = resolve(".payment-test");
  await mkdir(directory, { recursive: true });
  const path = join(directory, `${name}-${Date.now()}.db`);
  const db = new Database(path);
  for (const migration of (await readdir("prisma/migrations")).filter((name) => /^\d/.test(name)).sort()) {
    db.exec(await readFile(join("prisma/migrations", migration, "migration.sql"), "utf8"));
  }
  db.close();
  process.env.DATABASE_URL = `file:${path.replaceAll("\\", "/")}`;
  return path;
}
