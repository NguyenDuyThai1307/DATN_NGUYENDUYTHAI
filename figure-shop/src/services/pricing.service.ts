export type PromotionPricingInput = {
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
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
  now = new Date(),
): OrderPricing {
  const lines = items.map((item) => calculateLinePricing(item, now));

  const subtotal = lines.reduce((total, line) => {
    return total + line.originalTotal;
  }, 0);

  const discountAmount = lines.reduce((total, line) => {
    return total + line.discountAmount;
  }, 0);

  return {
    subtotal,
    discountAmount,
    shippingFee,
    total: subtotal - discountAmount + shippingFee,
  };
}