import { getPaginatedActiveProducts } from "@/services/product.service";
import { calculateLinePricing } from "@/services/pricing.service";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > 100) return Response.json({ products: [] });
  const result = await getPaginatedActiveProducts({ query }, 1, 5);
  return Response.json({ products: result.products.map(product => ({
    id: product.id, name: product.name, slug: product.slug,
    image: product.images[0]?.url ?? null,
    type: product.type,
    price: calculateLinePricing({ unitPrice: product.price, quantity: 1, promotion: product.promotion }).finalUnitPrice,
  })) });
}
