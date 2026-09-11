import fs from 'node:fs';
import sharp from 'sharp';
const entries = JSON.parse(fs.readFileSync('docs/product-image-imported.json', 'utf8'));
fs.mkdirSync('.image-work', { recursive: true });
for (let start = 0; start < entries.length; start += 25) {
  const items = entries.slice(start, start + 25);
  const height = Math.ceil(items.length / 5) * 205;
  const tiles = await Promise.all(items.map(async (p, i) => ({ input: await sharp(`public${p.localUrl}`).resize(180, 180, { fit: 'contain', background: '#fff' }).png().toBuffer(), left: i % 5 * 180, top: Math.floor(i / 5) * 205 })));
  const labels = items.map((p, i) => `<text x="${i % 5 * 180 + 4}" y="${Math.floor(i / 5) * 205 + 195}" font-size="10">${start + i + 1}. ${p.slug.slice(0, 27)}</text>`).join('');
  tiles.push({ input: Buffer.from(`<svg width="900" height="${height}">${labels}</svg>`), left: 0, top: 0 });
  await sharp({ create: { width: 900, height, channels: 3, background: '#eee' } }).composite(tiles).png().toFile(`.image-work/sheet-${start / 25 + 1}.png`);
}
console.log(`Created contact sheets for ${entries.length} images.`);
