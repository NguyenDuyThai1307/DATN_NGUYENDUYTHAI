import fs from 'node:fs';
const found = JSON.parse(fs.readFileSync('docs/product-image-web-results.json', 'utf8'));
const selections = JSON.parse(fs.readFileSync('docs/product-image-page-selections.json', 'utf8'));
const file = 'docs/product-image-page-metadata.json';
const metadata = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
const decode = s => s?.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');
for (const [slug, selection] of Object.entries(selections)) {
  const source = typeof selection === 'number' ? found[slug].results[selection].url : selection;
  if (metadata[slug]?.source === source) continue;
  try {
    const r = await fetch(source, { signal: AbortSignal.timeout(20000) });
    if (r.status === 429) { console.log(`RATE LIMITED ${new URL(source).host}`); continue; }
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const html = await r.text();
    const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
    const get = property => decode(tags.find(t => new RegExp(`(?:property|name)=["']${property}["']`, 'i').test(t))?.match(/content=(["'])(.*?)\1/i)?.[2]);
    const image = get('og:image');
    metadata[slug] = { source, title: get('og:title') ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1], image: image ? new URL(image, r.url).href : null,
      imageOptions: [...html.matchAll(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => ({ url: new URL(decode(m[1]), r.url).href, alt: decode(m[0].match(/alt=["']([^"']*)["']/i)?.[1]) })).filter(i => !/logo|icon|banner|bnr|spacer|loading|pixel/i.test(i.url)).slice(0,30) };
    fs.writeFileSync(file, JSON.stringify(metadata, null, 2));
    console.log(`${slug}: ${metadata[slug].title} | ${metadata[slug].image}`);
  } catch (error) { metadata[slug] = { source, error: error.message }; fs.writeFileSync(file, JSON.stringify(metadata, null, 2)); console.log(`FAILED ${slug}: ${error.message}`); }
  await new Promise(resolve => setTimeout(resolve, 1800));
}
