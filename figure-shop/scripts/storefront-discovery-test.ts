import 'dotenv/config';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma';
import { getPaginatedActiveProducts } from '../src/services/product.service';
async function main() {
  const brand = await getPaginatedActiveProducts({ query: 'Good Smile Company' });
  assert.ok(brand.total > 0, 'Brand searches must return products');
  const filtered = await getPaginatedActiveProducts({ type: 'IN_STOCK', minPrice: 500000, maxPrice: 2000000, sort: 'price_asc' });
  assert.ok(filtered.products.length > 0);
  assert.ok(filtered.products.every(p => p.type === 'IN_STOCK' && p.price >= 500000 && p.price <= 2000000));
  assert.ok(filtered.products.every((p,i,a) => i === 0 || a[i-1].price <= p.price));
  console.log('PASS: brand search, availability, price range and sorting');
}
main().finally(() => prisma.$disconnect());
