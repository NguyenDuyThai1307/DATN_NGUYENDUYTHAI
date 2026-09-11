import fs from 'node:fs';
import Database from 'better-sqlite3';
import sharp from 'sharp';
import 'dotenv/config';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const imported = read('docs/product-image-imported.json');
const audit = read('docs/product-image-audit.json');
const metadata = read('docs/product-image-page-metadata.json');
const searches = read('docs/product-image-web-results.json');
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
const knownReasons = {
  'infinity-studio-eva-unit-01-1-4': 'Nguồn hiện tại chỉ thấy phần trên mô hình; cần ảnh có toàn bộ thân và chân.',
  'prime1-dante-1-4': 'Nguồn hiện tại là banner cận nhân vật; cần ảnh toàn thân đúng tỷ lệ 1/4.',
  'prime1-vergil-1-4': 'Nguồn hiện tại là banner cận nhân vật; cần ảnh toàn thân đúng tỷ lệ 1/4.',
  'taito-coreful-mai-sakurajima': 'Ảnh hiện có ghép hình cận mặt với hình toàn thân nhỏ; cần ảnh toàn thân riêng.',
  'taito-desktop-cute-miku-nakano': 'Ảnh đã kiểm tra bị cắt phần chân; cần góc chụp đầy đủ.',
  'frieren-1-7': 'Nguồn tìm được là Claynel; hãng trong danh mục là Good Smile Company. Cần xác nhận lại hãng.',
  'albedo-white-dress-1-7': 'Nguồn tìm được là F:NEX/FuRyu; cần đối chiếu lại hãng trong danh mục.',
  'rem-crystal-dress-1-7': 'Phiên bản Crystal Dress tìm được thuộc eStream; cần đối chiếu hãng trong danh mục.',
  'emilia-crystal-dress-1-7': 'Phiên bản Crystal Dress tìm được thuộc eStream; cần đối chiếu hãng trong danh mục.',
  'dollfie-dream-saber-alter': 'Trang tìm được là Santa Alter; chưa xác nhận đúng phiên bản cần dùng.',
  'dollfie-dream-sakura-miku': 'Trang đã kiểm tra là phụ kiện tóc; chưa lấy được ảnh chính của búp bê.',
  'dollfie-dream-2b': 'Trang đã kiểm tra là phiên bản 2.0; danh mục chưa ghi phiên bản.',
  'pop-mart-dimoo-world-pixar': 'Ảnh tìm được quá nhỏ, không đạt tối thiểu 200 × 200 px.',
  'rement-spy-family-petit-rama': 'Nguồn tìm được thuộc MegaHouse; chưa khớp hãng Re-Ment trong danh mục.',
};
const cell = text => String(text ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const reason = p => knownReasons[p.slug] ?? (metadata[p.slug]?.error
  ? `Chưa tải được nguồn đã chọn (${metadata[p.slug].error}); cần nguồn thay thế.`
  : /popmart\.com/.test(metadata[p.slug]?.source ?? '') && metadata[p.slug]?.image?.endsWith('/512.png')
    ? 'Trang trả về logo chung, chưa lấy được ảnh sản phẩm.'
    : 'Đã tìm kiếm nhưng chưa xác minh đủ hãng, dòng và phiên bản để gắn ảnh. Cần mã sản phẩm hoặc tên phiên bản đầy đủ.');
const lines = [
  '# Báo cáo ảnh sản phẩm', '',
  `Cập nhật: ${new Date().toISOString()}.`, '',
  `- Tổng sản phẩm: **${products.length}**.`,
  `- Ban đầu có ảnh: **${audit.filter(p => p.images.length).length}**; thiếu **${audit.filter(p => !p.images.length).length}**.`,
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
  ...missing.map(p => {
    const url = metadata[p.slug]?.source ?? searches[p.slug]?.results?.[0]?.url;
    return `| ${cell(p.name)} | ${cell(reason(p))} | ${url ? `[Xem nguồn](${url})` : 'Chưa có nguồn phù hợp'} |`;
  }), '', '## Các ảnh đã bổ sung', '', '| Sản phẩm | Ảnh local | Nguồn |', '|---|---|---|',
  ...imported.map(p => `| ${cell(products.find(x => x.slug === p.slug)?.name ?? p.slug)} | [Ảnh](../public${p.localUrl}) | [Nguồn](${p.source}) |`), '',
  '## Chạy lại công cụ', '',
  'Sau khi đối chiếu nguồn, thêm mục vào `docs/product-image-approved.json`, chạy `node scripts/import-product-images.mjs`, rồi `node scripts/report-product-images.mjs`. Công cụ nhập ảnh bỏ qua sản phẩm đã có ảnh và sao lưu DB trước khi nhập. Công cụ báo cáo cập nhật mapping cho seed; không cần chạy seed lên dữ liệu hiện tại.', '',
];
fs.writeFileSync('docs/PRODUCT_IMAGE_REPORT.md', lines.join('\n'));
db.close();
console.log(JSON.stringify({ products: products.length, imported: imported.length, withImages: products.length - missing.length, missing: missing.length, checkedLocalImages: images.length, issues }, null, 2));
