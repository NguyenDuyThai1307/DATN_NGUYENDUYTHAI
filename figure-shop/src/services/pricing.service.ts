export type PromotionPricingInput = {
  id?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
};

export type CouponPricingInput = {
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
};

export type PricingItemInput = {
  unitPrice: number;
  quantity: number;
  promotion?: PromotionPricingInput | null;
};

export type LinePricing = {
  unitPrice: number;
  finalUnitPrice: number;
  quantity: number;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
};

export type OrderPricing = {
  subtotal: number;
  productDiscountAmount: number;
  couponDiscountAmount: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
};

export function isPromotionActive(
  promotion: PromotionPricingInput,
  now = new Date(),
) {
  return (
    promotion.isActive &&
    promotion.startsAt <= now &&
    promotion.endsAt >= now
  );
}

export function isCouponActive(
  coupon: CouponPricingInput,
  now = new Date(),
) {
  const hasRemainingUsage =
    coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit;

  return (
    coupon.isActive &&
    hasRemainingUsage &&
    coupon.startsAt <= now &&
    coupon.endsAt >= now
  );
}

function calculateDiscountPerUnit(
  unitPrice: number,
  promotion: PromotionPricingInput | null | undefined,
  now: Date,
) {
  if (!promotion || !isPromotionActive(promotion, now)) {
    return 0;
  }

  const discount =
    promotion.type === "PERCENTAGE"
      ? Math.floor((unitPrice * promotion.value) / 100)
      : promotion.value;

  return Math.min(Math.max(discount, 0), unitPrice);
}

export function selectBestPromotion<T extends PromotionPricingInput>(
  unitPrice: number,
  promotions: T[],
  now = new Date(),
): T | null {
  let bestPromotion: T | null = null;
  let bestDiscount = 0;

  for (const promotion of promotions) {
    const discount = calculateDiscountPerUnit(unitPrice, promotion, now);

    if (discount > bestDiscount) {
      bestPromotion = promotion;
      bestDiscount = discount;
    }
  }

  return bestPromotion;
}

export function calculateCouponDiscount(
  orderAmount: number,
  coupon: CouponPricingInput | null | undefined,
  now = new Date(),
) {
  if (!coupon || !isCouponActive(coupon, now)) {
    return 0;
  }

  if (orderAmount < coupon.minOrderValue) {
    return 0;
  }

  let discount =
    coupon.type === "PERCENTAGE"
      ? Math.floor((orderAmount * coupon.value) / 100)
      : coupon.value;

  if (coupon.maxDiscountAmount !== null) {
    discount = Math.min(discount, coupon.maxDiscountAmount);
  }

  return Math.min(Math.max(discount, 0), orderAmount);
}

export function calculateLinePricing(
  { unitPrice, quantity, promotion }: PricingItemInput,
  now = new Date(),
): LinePricing {
  const originalTotal = unitPrice * quantity;
  const discountPerUnit = calculateDiscountPerUnit(
    unitPrice,
    promotion,
    now,
  );
  const discountAmount = discountPerUnit * quantity;
  const finalUnitPrice = unitPrice - discountPerUnit;

  return {
    unitPrice,
    finalUnitPrice,
    quantity,
    originalTotal,
    discountAmount,
    finalTotal: originalTotal - discountAmount,
  };
}

export function calculateOrderPricing(
  items: PricingItemInput[],
  shippingFee = 0,
  coupon?: CouponPricingInput | null,
  now = new Date(),
): OrderPricing {
  const lines = items.map((item) => calculateLinePricing(item, now));

  const subtotal = lines.reduce((total, line) => {
    return total + line.originalTotal;
  }, 0);

  const productDiscountAmount = lines.reduce((total, line) => {
    return total + line.discountAmount;
  }, 0);

  const amountAfterProductDiscount = subtotal - productDiscountAmount;

  const couponDiscountAmount = calculateCouponDiscount(
    amountAfterProductDiscount,
    coupon,
    now,
  );

  const discountAmount = productDiscountAmount + couponDiscountAmount;

  return {
    subtotal,
    productDiscountAmount,
    couponDiscountAmount,
    discountAmount,
    shippingFee,
    total: subtotal - discountAmount + shippingFee,
  };
}
