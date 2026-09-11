import "dotenv/config";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { Database } from "./payment-test-db";
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:")) throw new Error("Expected local SQLite DATABASE_URL");
  const source = new Database(resolve(url.slice(5)));
  const dir = resolve("backups");
  await mkdir(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = join(dir, `before-online-payments-${stamp}.db`);
  const trial = join(dir, `migration-trial-${stamp}.db`);
  const tables = ["Order", "OrderItem", "Payment", "Product", "Coupon", "User"];
  const snapshots = tables.map((table) => source.prepare(`SELECT * FROM "${table}" ORDER BY id`).all());
  await source.backup(backup);
  await source.backup(trial);
  source.close();
  const db = new Database(trial);
  if (!db.prepare("PRAGMA table_info('Payment')").all().some((c) => c.name === "environment")) db.exec(await readFile("prisma/migrations/20260909090000_online_payments/migration.sql", "utf8"));
  if (!db.prepare("PRAGMA table_info('Order')").all().some((c) => c.name === "cancelRequestedAt")) db.exec(await readFile("prisma/migrations/20260909093000_payment_cancel_request/migration.sql", "utf8"));
  for (let i = 0; i < tables.length; i++) {
    const after = db.prepare(`SELECT * FROM "${tables[i]}" ORDER BY id`).all();
    assert.equal(after.length, snapshots[i].length);
    for (let j = 0; j < after.length; j++) for (const [key, value] of Object.entries(snapshots[i][j])) assert.deepEqual(after[j][key], value);
  }
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  db.close();
  console.log(`Backup saved: ${backup}`);
  console.log("Migration trial passed: original columns, row counts and foreign keys preserved.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
