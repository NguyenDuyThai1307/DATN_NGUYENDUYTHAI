import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';
import sharp from 'sharp';
import 'dotenv/config';

// Only import explicitly reviewed matches. Never replace existing product images.
const entries = JSON.parse(fs.readFileSync('docs/product-image-approved.json', 'utf8'));
const manifestFile = 'docs/product-image-imported.json';
const imported = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : [];
const db = new Database(process.env.DATABASE_URL.replace(/^file:/, ''));
fs.mkdirSync('backups', { recursive: true });
await db.backup(`backups/before-image-import-${Date.now()}.db`);
fs.mkdirSync('public/images/products/sourced', { recursive: true });
for (const entry of entries) {
  const product = db.prepare('SELECT id, name FROM Product WHERE slug=?').get(entry.slug);
  if (!product || db.prepare('SELECT id FROM ProductImage WHERE productId=? LIMIT 1').get(product.id)) continue;
  try {
    const response = await fetch(entry.image, { signal: AbortSignal.timeout(25000) });
    if (response.status === 429) { console.log('Rate limited; stopped without changing remaining products.'); break; }
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Invalid image response: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 15_000_000) throw new Error('Image exceeds 15 MB');
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height || metadata.width < 200 || metadata.height < 200) throw new Error('Image too small');
    const url = `/images/products/sourced/${entry.slug}.webp`;
    const target = path.join('public', url);
    await sharp(buffer).rotate().resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toFile(target);
    db.transaction(() => {
      if (db.prepare('SELECT id FROM ProductImage WHERE productId=? LIMIT 1').get(product.id)) return;
      db.prepare('INSERT INTO ProductImage (id, productId, url, alt, sortOrder, createdAt) VALUES (?, ?, ?, ?, 0, ?)').run(randomUUID(), product.id, url, product.name, Date.now());
    })();
    imported.push({ ...entry, localUrl: url, importedAt: new Date().toISOString(), width: metadata.width, height: metadata.height });
    fs.writeFileSync(manifestFile, JSON.stringify(imported, null, 2));
    console.log(`IMPORTED ${entry.slug}`);
  } catch (error) { console.log(`FAILED ${entry.slug}: ${error.message}`); }
  await new Promise(resolve => setTimeout(resolve, 700));
}
db.close();
