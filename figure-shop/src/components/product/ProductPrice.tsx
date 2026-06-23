type ProductPriceProps = {
  price: number;
  originalPrice?: number;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function ProductPrice({
  price,
  originalPrice,
}: ProductPriceProps) {
  const hasDiscount =
    originalPrice !== undefined && originalPrice > price;

  return (
    <span className="inline-flex flex-wrap items-baseline gap-2">
      {hasDiscount ? (
        <span className="text-xs font-medium text-zinc-400 line-through">
          {currencyFormatter.format(originalPrice)}
        </span>
      ) : null}

      <span className="font-semibold text-red-600">
        {currencyFormatter.format(price)}
      </span>
    </span>
  );
}