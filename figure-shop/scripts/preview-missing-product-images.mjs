import fs from 'node:fs';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
const metadata = JSON.parse(fs.readFileSync('docs/product-image-page-metadata.json', 'utf8'));
const imported = JSON.parse(fs.readFileSync('docs/product-image-imported.json', 'utf8'));
const entries = Object.entries(metadata).filter(([slug, p]) => p.image && !imported.some(x => x.slug === slug) && !p.image.endsWith('/512.png')).map(([slug, p]) => ({ slug, ...p }));
fs.mkdirSync('.image-work/review', { recursive: true });
const successful = [];
for (const entry of entries) {
  const file = `.image-work/review/${entry.slug}-${createHash('sha1').update(entry.image).digest('hex').slice(0,8)}.png`;
  try {
    if (!fs.existsSync(file)) {
      const r = await fetch(entry.image, { signal: AbortSignal.timeout(15000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await sharp(Buffer.from(await r.arrayBuffer())).resize(230, 210, { fit: 'contain', background: '#fff' }).png().toFile(file);
      await new Promise(r => setTimeout(r, 500));
    }
    successful.push({ ...entry, previewFile: file });
  } catch (e) { console.log(`${entry.slug}: ${e.message}`); }
}
fs.writeFileSync('.image-work/review/index.json', JSON.stringify(successful, null, 2));
for (let start = 0; start < successful.length; start += 20) {
  const batch = successful.slice(start, start + 20), height = Math.ceil(batch.length / 4) * 240;
  const tiles = batch.map((e, i) => ({ input: e.previewFile, left: i % 4 * 230, top: Math.floor(i / 4) * 240 }));
  const labels = batch.map((e, i) => `<text x="${i % 4 * 230 + 3}" y="${Math.floor(i / 4) * 240 + 225}" font-size="10">${start + i}. ${e.slug.slice(0, 34)}</text>`).join('');
  tiles.push({ input: Buffer.from(`<svg width="920" height="${height}">${labels}</svg>`), left: 0, top: 0 });
  await sharp({ create: { width: 920, height, channels: 3, background: '#eee' } }).composite(tiles).png().toFile(`.image-work/review/contact-${start / 20}.png`);
}
console.log(`Previewed ${successful.length} candidates.`);
