import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSION_BY_TYPE = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function saveUploadedProductImage(
  entry: FormDataEntryValue | null,
) {
  if (!(entry instanceof File) || entry.size === 0) {
    return null;
  }

  const extension = IMAGE_EXTENSION_BY_TYPE.get(entry.type.toLowerCase());

  if (!extension) {
    throw new Error("Ảnh sản phẩm phải có định dạng JPG, PNG, WebP hoặc AVIF");
  }

  if (entry.size > MAX_PRODUCT_IMAGE_SIZE) {
    throw new Error("Ảnh sản phẩm không được lớn hơn 5 MB");
  }

  const imageDirectory = join(process.cwd(), "public", "images", "products");
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;

  await mkdir(imageDirectory, { recursive: true });
  await writeFile(
    join(imageDirectory, fileName),
    Buffer.from(await entry.arrayBuffer()),
  );

  return `/images/products/${fileName}`;
}
