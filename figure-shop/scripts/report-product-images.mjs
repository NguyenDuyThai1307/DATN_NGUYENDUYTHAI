import fs from 'node:fs';
import Database from 'better-sqlite3';
import sharp from 'sharp';
import 'dotenv/config';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const imported = read('docs/product-image-imported.json');
const db = new Database(process.env.DATABASE_URL.replace(/^file:/, ''), { readonly: true });
const products = db.prepare('SELECT id, name, slug FROM Product ORDER BY name').all();
const images = db.prepare('SELECT productId, url FROM ProductImage').all();
const issues = [];
for (const image of images) {
  if (!image.url.startsWith('/images/')) { issues.push(`Unexpected image URL: ${image.url}`); continue; }
  try { await sharp(`public${image.url}`).stats(); }
  catch { issues.push(`Unreadable image: ${image.url}`); }
}
for (const entry of imported) {
  const product = products.find(p => p.slug === entry.slug);
  if (!product || !images.some(i => i.productId === product.id && i.url === entry.localUrl)) issues.push(`Manifest mismatch: ${entry.slug}`);
}
if (issues.length) throw new Error(issues.join('\n'));
fs.writeFileSync('prisma/sourced-product-images.json', JSON.stringify(Object.fromEntries(imported.map(p => [p.slug, p.localUrl])), null, 2) + '\n');
const missing = products.filter(p => !images.some(i => i.productId === p.id));
const cell = text => String(text ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const lines = [
  '# Báo cáo ảnh sản phẩm', '',
  `Cập nhật: ${new Date().toISOString()}.`, '',
  `- Tổng sản phẩm: **${products.length}**.`,
  `- Đã bổ sung: **${imported.length}**.`,
  `- Hiện có ảnh: **${products.length - missing.length}**; còn thiếu **${missing.length}**.`,
  '- Đã tìm kiếm từng mục thiếu ảnh. Kết quả tìm kiếm không đồng nghĩa đã xác minh đúng sản phẩm.',
  '- Ảnh được lưu WebP trong public/images/products/sourced; nguồn gốc lưu trong product-image-imported.json.',
  '- Giữ các ảnh có sẵn. Không thay tên, hãng, giá hoặc phương thức thanh toán.',
  '- Một số ảnh nguồn là ảnh hộp hoặc ảnh quảng bá sản phẩm; có thể thay bằng ảnh chụp sản phẩm sau.',
  '- Đợt bổ sung tiếp theo yêu cầu ảnh thấy đầy đủ nhân vật; chấp nhận nguồn cửa hàng và cộng đồng cho website demo nội bộ. Các ảnh từ đợt trước chưa được rà lại toàn bộ theo tiêu chí mới này.',
  '- Với các tên chung, ảnh thể hiện một phiên bản của nhân vật hoặc một mẫu trong bộ blind box. Một số trường hãng trong danh mục (ví dụ Frieren 1/7, Rem/Emilia Crystal Dress) chưa khớp hãng tại nguồn; ảnh dùng minh họa demo, cần đối chiếu lại metadata trước khi dùng làm danh mục bán hàng.',
  '- Đã kiểm tra giải mã toàn bộ ảnh local và đối chiếu manifest với cơ sở dữ liệu.', '',
  '## Các mục cần xử lý tiếp', '',
  'Các liên kết dưới đây là nguồn ứng viên, chưa phải xác nhận ảnh đúng. Với tên chung có nhiều biến thể, cần xác nhận mã/phiên bản trước khi chọn ảnh.', '',
  '| Sản phẩm | Lý do chưa gắn ảnh | Nguồn ứng viên |', '|---|---|---|',
  ...missing.map(p => `| ${cell(p.name)} | Chưa gắn ảnh | - |`), '', '## Các ảnh đã bổ sung', '', '| Sản phẩm | Ảnh local | Nguồn |', '|---|---|---|',
  ...imported.map(p => `| ${cell(products.find(x => x.slug === p.slug)?.name ?? p.slug)} | [Ảnh](../public${p.localUrl}) | [Nguồn](${p.source}) |`), '',
  '## Chạy lại công cụ', '',
  'Sau khi đối chiếu nguồn, thêm mục vào `docs/product-image-approved.json`, chạy `node scripts/import-product-images.mjs`, rồi `node scripts/report-product-images.mjs`. Công cụ nhập ảnh bỏ qua sản phẩm đã có ảnh và sao lưu DB trước khi nhập. Công cụ báo cáo cập nhật mapping cho seed; không cần chạy seed lên dữ liệu hiện tại.', '',
];
fs.writeFileSync('docs/PRODUCT_IMAGE_REPORT.md', lines.join('\n'));
db.close();
console.log(JSON.stringify({ products: products.length, imported: imported.length, withImages: products.length - missing.length, missing: missing.length, checkedLocalImages: images.length, issues }, null, 2));
