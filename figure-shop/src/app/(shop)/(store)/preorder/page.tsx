import ProductCatalog from "@/components/product/ProductCatalog";
import type { ComponentProps } from "react";
export default function PreorderPage({ searchParams }: Pick<ComponentProps<typeof ProductCatalog>, "searchParams">) {
  return <ProductCatalog searchParams={searchParams} preorder />;
}
