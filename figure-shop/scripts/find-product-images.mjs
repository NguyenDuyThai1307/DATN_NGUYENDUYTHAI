import fs from 'node:fs';

const audit = JSON.parse(fs.readFileSync('docs/product-image-audit.json', 'utf8'));
const file = 'docs/product-image-candidates.json';
const result = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
const base = 'https://www.usagundamstore.com';
for (const product of audit.filter(p => !p.images.some(i => i.exists))) {
  if (result[product.slug]) continue;
  const query = product.name.replace(/^High Grade /, 'HG ').replace(/^Master Grade /, 'MG ').replace(/^Real Grade /, 'RG ').replace(/^Perfect Grade /, 'PG ');
  try {
    const url = `${base}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=10&resources[options][unavailable_products]=show&resources[options][fields]=title`;
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (response.status === 429) { console.log('Rate limited; stopped. Resume later using saved progress.'); break; }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    result[product.slug] = { name: product.name, brand: product.brand, query, candidates: data.resources.results.products.map(p => ({ title: p.title, vendor: p.vendor, image: p.image, source: new URL(p.url.split('?')[0], base).href })) };
    fs.writeFileSync(file, JSON.stringify(result, null, 2));
    console.log(`${Object.keys(result).length}: ${product.slug}`);
  } catch (error) { console.log(`FAILED ${product.slug}: ${error.message}`); }
  await new Promise(resolve => setTimeout(resolve, 3000));
}
