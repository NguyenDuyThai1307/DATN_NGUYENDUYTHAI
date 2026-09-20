import ProductCatalog from "@/components/product/ProductCatalog";
import type { ComponentProps } from "react";
export default function ProductsPage({ searchParams }: Pick<ComponentProps<typeof ProductCatalog>, "searchParams">) {
  return <ProductCatalog searchParams={searchParams} />;
}
