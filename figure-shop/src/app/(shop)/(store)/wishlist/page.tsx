import { WishlistProducts } from "@/components/product/WishlistProducts";
import { getActiveProducts } from "@/services/product.service";
export default async function WishlistPage() {
  const products = await getActiveProducts();
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><h1 className="text-3xl font-black">Sản phẩm yêu thích</h1><p className="mb-7 mt-3 text-sm text-zinc-500">Các mô hình bạn đã lưu trên trình duyệt này. Giá và tình trạng hàng được cập nhật theo cửa hàng.</p><WishlistProducts products={products} /></main>;
}
