# Rà soát checklist — 10/09/2026

Phạm vi cập nhật: giữ nguyên COD và chuyển khoản/demo để trình diễn nội bộ, không nghiệm thu payOS/VNPAY. Báo cáo này đối chiếu PROJECT_STRUCTURE_AND_PROGRESS.md, README, docs/notes.md, kế hoạch/hướng dẫn thanh toán, schema, API, service, UI và scripts. Các checkbox cũ phản ánh mốc lịch sử, không thay thế bằng chứng nghiệm thu hiện tại.

## 1. Đã xác nhận

- [x] Có mã nguồn đăng ký, đăng nhập, đăng xuất, JWT cookie và phân quyền CUSTOMER/STAFF/ADMIN.
- [x] Có danh sách/chi tiết sản phẩm, tìm kiếm/lọc/sắp xếp và trang preorder.
- [x] Có giỏ hàng, coupon/promotion, server tính tổng tiền, checkout và snapshot đơn hàng.
- [x] Có thanh toán DEMO chuyển đơn sang PAID/CONFIRMED, kiểm chủ đơn, cờ bật và đơn đã hủy.
- [x] Có lịch sử/chi tiết đơn khách hàng và các trang xem đơn của admin.
- [x] Có quản trị sản phẩm, danh mục, thương hiệu, khuyến mãi, coupon và upload ảnh chính.
- [x] Có trợ lý AI, truy vấn catalog và fallback; test công cụ/fallback đã qua, chưa kết luận chất lượng hội thoại với model bên ngoài.
- [x] Cấu hình local đúng: APP_URL=http://localhost:3000, DEMO_PAYMENT_ENABLED=true, PAYOS_ENABLED=false, VNPAY_ENABLED=false. Không đọc/in khóa merchant.

### Kiểm tra chạy lại trong lượt audit

| Lệnh | Kết quả | Giới hạn bằng chứng |
| --- | --- | --- |
| `npm.cmd run test:smoke` | PASS | Service với bản sao DB, bao gồm checkout/DEMO và admin CRUD |
| `npm.cmd run test:payment` | PASS, 16 nhóm | DB test, mock cổng, có kiểm tra transaction/chống lặp; không chuyển tiền |
| `npm.cmd run test:payment:http` | PASS | Server/DB riêng, callback/auth/CSRF/return; tạo JWT trực tiếp, DEMO tắt trong fixture |
| `npm.cmd run test:ai` | PASS | Công cụ tìm sản phẩm, giá và contextual fallback; không nghiệm thu model live |
| `npx.cmd tsc --noEmit` | PASS | Kiểu dữ liệu |
| `npm.cmd run lint` | PASS | Quy tắc lint |
| `npm.cmd run build` | PASS | Build production |

Không có kiểm thử trực quan desktop/mobile trong lượt audit này. Không tạo đơn test trong DB đang dùng, không thay mã chức năng.

## 2. Việc còn cần ưu tiên cho bản DEMO

| ID | Trạng thái | Việc cần làm | Bằng chứng / tiêu chí hoàn thành |
| --- | --- | --- | --- |
| D01 | Giữ nguyên theo yêu cầu | Không thay đổi lựa chọn thanh toán | Chủ dự án xác nhận giữ COD và chuyển khoản/demo; không còn yêu cầu checkout chỉ có DEMO. |
| D02 | Đã triển khai | Dashboard doanh thu nội bộ | Có lọc 7/30/90 ngày, so sánh kỳ trước, biểu đồ/bảng ngày, tách COD và CK/demo, giá trị chưa thanh toán và nhãn mô phỏng. |
| D03 | Chưa có chức năng | Admin cập nhật trạng thái đơn | Đã có enum/badge/progress nhưng không có API/action/form chuyển CONFIRMED → PROCESSING → SHIPPED → COMPLETED. `api/orders/[id]` chỉ có GET. |
| D04 | Chưa có cho DEMO | Hủy đơn DEMO chưa trả tiền và hoàn kho/coupon đúng một lần | DEMO cũng trừ kho/giữ lượt coupon khi tạo đơn, nhưng service release hiện chỉ cho PAYOS/VNPAY. Cần hoàn thiện nếu cho phép khách/admin hủy hoặc để đơn bỏ dở trong kịch bản demo. |
| D05 | Chưa đủ test toàn luồng | HTTP/E2E đăng ký → đăng nhập → mua → trả DEMO → đăng xuất | Test HTTP hiện ký JWT trực tiếp và tắt DEMO; smoke test kiểm service DEMO. Cần ca thành công qua HTTP/UI, sai mật khẩu, email trùng, sai quyền, bấm thanh toán lặp. |
| D06 | Chưa nghiệm thu trực quan | Desktop/mobile và các trạng thái lỗi | Kiểm menu, bộ lọc, giỏ, checkout, chi tiết đơn, admin, màn hình nhỏ và lỗi mạng/validation. |
| D07 | Chưa có bằng chứng trong workspace | Hồ sơ báo cáo và kịch bản bảo vệ | Không tìm thấy DOCX/PDF/PPTX trong phạm vi quét workspace. Không kết luận tài liệu ngoài workspace chưa làm. Cần xác nhận báo cáo, slide, ERD/use case/sequence, bảng test, ảnh/video demo và tài khoản/dữ liệu trình diễn. |

Thứ tự còn lại: D03–D04 → D05–D06 → D07. D02 được triển khai sau lượt audit theo yêu cầu mới. Test tính doanh thu nằm tại `scripts/admin-revenue-test.ts`; kế hoạch cải thiện hình ảnh tại `docs/VISUAL_IMPROVEMENT_PLAN.md`.

## 3. Checklist mở rộng — không bắt buộc nếu không đưa vào đề cương

- [ ] Quản lý nhiều ảnh sản phẩm, đổi thứ tự và xóa riêng từng ảnh. Schema có nhiều ảnh nhưng form/service quản trị hiện thay bằng một ảnh chính.
- [ ] Gắn video review thật hoặc bỏ biểu tượng play nếu chỉ dùng thẻ nội dung. `home-content.ts` có thumbnail ảnh sản phẩm; `HomeContentBlocks.tsx` chưa có URL/player video.
- [ ] Series, Review, Wishlist, InventoryLog: chưa có model/chức năng tương ứng; chỉ làm nếu phạm vi khóa luận yêu cầu.
- [ ] Xem lại yêu cầu shadcn/ui, framer-motion, sonner. Chưa có các dependency này; UI primitives tự xây đã hoạt động. Đây là lựa chọn kỹ thuật, không tự coi thiếu thư viện là thiếu chức năng.

## 4. Không còn là điều kiện hoàn thành theo phạm vi mới

Các mục sau ghi **ngoài phạm vi**, không đánh dấu hoàn thành giả và không yêu cầu người dùng tiếp tục:

- Định danh/liên kết ngân hàng payOS, giao dịch tiền thật.
- Kiểm thử merchant VNPAY Sandbox, IPN từ cổng, QueryDr live.
- Mua tên miền, Cloudflare Tunnel cố định, callback HTTPS công khai.
- Cài scheduler đối soát cổng, hoàn tiền thực tế và vận hành thanh toán online.

Code adapter/migration/test online đã tồn tại và đang được giữ lại, hai cổng bị tắt trong `.env`. Người dùng đã báo nhận thông tin VNPAY và từng tạo Quick Tunnel, nhưng đó không phải bằng chứng giao dịch Sandbox thành công và không còn là đầu việc bắt buộc.

## 5. Tài liệu/checklist cần hiểu đúng

- Mục 14 tổng hợp từng đánh dấu cả “polish UI và chuẩn bị báo cáo” là hoàn thành. Chỉ đủ bằng chứng phần UI/code; hồ sơ báo cáo cần xác nhận riêng.
- `docs/notes.md` còn ghi admin form, ảnh sản phẩm và tìm kiếm là việc tương lai dù code đã có; đã thêm chỉ dẫn xem audit hiện tại.
- Phần thanh toán trong tài liệu tổng từng ghi chưa có code TT1–TT3; đã cập nhật thành lịch sử triển khai và đánh dấu nghiệm thu cổng ngoài phạm vi.
- Sơ đồ thư mục và tên component trong kế hoạch là cấu trúc đề xuất, không phải tất cả file bắt buộc. Ví dụ sort được tích hợp trong bộ lọc/service, không nhất thiết có ProductSort.tsx riêng.
- Repository có nhiều thay đổi chưa commit. Việc chốt commit/bản sao nộp bài vẫn cần thực hiện sau khi hoàn thiện; không tự commit trong lượt audit.
