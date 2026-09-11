import 'dotenv/config';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma';
import { getEffectiveProductPromotion, productPromotionInclude } from '../src/services/promotion.service';
import { getProductsForPromotionForm } from '../src/services/admin-promotion.service';

async function main() {
  const products = await prisma.product.findMany({ include: productPromotionInclude });
  const preorder = products.find(p => p.type === 'PREORDER');
  const stock = products.find(p => p.type === 'IN_STOCK');
  assert.ok(preorder && stock);
  const now = new Date();
  const promotion = {
    id: 'test-only', scope: 'PRODUCT' as const, productId: preorder.id,
    categoryId: null, brandId: null, name: 'Test', type: 'PERCENTAGE' as const,
    value: 25, startsAt: new Date(now.getTime() - 1000), endsAt: new Date(now.getTime() + 60000),
    isActive: true, createdAt: now, updatedAt: now,
  };
  assert.equal(getEffectiveProductPromotion({ ...preorder, promotion }, now), null);
  assert.ok(preorder.brand);
  assert.equal(getEffectiveProductPromotion({ ...preorder, promotion: null,
    brand: { ...preorder.brand, promotions: [{ ...promotion, scope: 'BRAND', productId: null, brandId: preorder.brand.id }] },
  }, now), null);
  assert.ok(getEffectiveProductPromotion({ ...stock, promotion }, now));
  assert.ok(products.filter(p => p.type === 'PREORDER').every(p => getEffectiveProductPromotion(p) === null));
  const options = await getProductsForPromotionForm();
  assert.ok(options.every(option => products.find(p => p.id === option.id)?.type === 'IN_STOCK'));
  console.log('PASS: preorder excluded from promotions; stock promotions and admin options verified.');
}
main().finally(() => prisma.$disconnect());
