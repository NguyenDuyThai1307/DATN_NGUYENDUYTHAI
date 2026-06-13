type ProductPriceProps = {
  price: number;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export function ProductPrice({ price }: ProductPriceProps) {
  return (
    <span className="font-semibold text-red-600">
      {currencyFormatter.format(price)}
    </span>
  );
}