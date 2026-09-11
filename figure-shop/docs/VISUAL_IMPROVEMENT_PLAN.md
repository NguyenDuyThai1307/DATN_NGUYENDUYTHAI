# Phương án cải thiện giao diện Figure Shop

Phạm vi: giữ nguyên checkout COD và chuyển khoản/demo. Kế hoạch storefront bên dưới đã được triển khai theo yêu cầu tiếp theo; nghiệm thu trực quan vẫn còn chờ kết nối trình duyệt.

## Tiến độ triển khai — 10/09/2026

- [x] Header trắng gọn, thanh tìm kiếm hiện trực tiếp trên mobile, giỏ hàng dễ truy cập; sửa menu tablet 768–1023px.
- [x] Hero tách phần chữ và ảnh, dùng ảnh hiện có với vị trí ảnh bên phải phù hợp chủ thể; CTA rõ ràng, không phủ chữ lên mô hình.
- [x] Trang chủ theo thứ tự danh mục → hàng có sẵn → ưu đãi → preorder → dịch vụ → góc sưu tầm → tin tức → thương hiệu. Mỗi kệ tối đa 8 sản phẩm.
- [x] Bỏ countdown cố định và các khối sale/tin tức lặp; bỏ nút play giả, thêm liên kết có đích rõ cho góc sưu tầm.
- [x] Ảnh sản phẩm và thumbnail gallery dùng contain; đồng nhất khung, khoảng trống thương hiệu, trạng thái hết hàng, nút giỏ hàng 44px.
- [x] Đưa khối mua lên trước mô tả dài ở trang chi tiết; giữ thông số, preorder và cam kết giao hàng hiện có. Không tự tạo ảnh góc chụp hay thông số sản phẩm chưa có dữ liệu.
- [x] Hiệu ứng hover nhẹ, focus bàn phím, Escape/đóng menu, reduced motion; phản hồi thêm giỏ thành công/lỗi mạng và trạng thái tải không đổi kích thước nút.
- [x] Bổ sung loading trang cửa hàng/chi tiết sản phẩm và giao diện thử lại khi tải lỗi.
- [x] TypeScript, lint, build và smoke test nghiệp vụ đạt. HTTP trang chủ/sản phẩm/preorder trả 200; giỏ và checkout của khách chưa đăng nhập chuyển tới login đúng luồng.
- [ ] Kiểm tra ảnh chụp trước/sau, bàn phím và thao tác thực tế ở 360/390/768/1440px. Browser báo không có trình duyệt khả dụng; HTTP và build không thay thế kiểm tra này.
- [ ] Đo hiệu năng hình ảnh bằng trình duyệt. Ảnh hiện có vẫn dùng Next Image; chưa có bằng chứng đo tốc độ để kết luận cải thiện.

## 1. Hướng hình ảnh

Chọn phong cách cửa hàng mô hình hiện đại: nền trắng/xám rất nhạt, chữ than đậm, một màu đỏ thương hiệu cho CTA và giá giảm. Header vàng, hero đỏ và các khối nhiều màu hiện cạnh tranh sự chú ý; giảm diện tích màu đặc, dành màu nhấn cho hành động mua và ưu đãi.

- Hero: một ảnh mô hình chủ đạo chất lượng tốt, vùng trống cho tiêu đề, một nút chính “Khám phá sản phẩm”, một liên kết phụ “Xem preorder”. Chuẩn bị crop riêng cho mobile, kiểm tra không che mặt/chi tiết mô hình.
- Ảnh danh sách: dùng nền trung tính đồng nhất, khung vuông và `object-contain` cho ảnh toàn thân thay vì `object-cover` dễ cắt đầu/chân. Ảnh lifestyle/banner vẫn có thể dùng cover.
- Chuẩn hóa thẻ sản phẩm: vị trí badge, chiều cao tên hai dòng, giá và nút mua cùng hàng; tối đa hai badge quan trọng.
- Ưu tiên ảnh thật của sản phẩm; tối ưu dung lượng, khai báo kích thước ảnh để tránh nhảy bố cục. Bổ sung ảnh góc nghiêng/chi tiết ở trang sản phẩm khi có bộ ảnh phù hợp.

## 2. Thứ tự trang chủ

1. Header gọn: logo, tìm kiếm, tài khoản, giỏ hàng; mobile ưu tiên tìm kiếm và menu dễ chạm.
2. Hero giới thiệu cửa hàng và bộ sưu tập chủ đạo.
3. Danh mục nổi bật để khách chọn nhanh loại mô hình.
4. Sản phẩm nổi bật hoặc mới về, khoảng 8 sản phẩm và liên kết xem tất cả.
5. Một khối ưu đãi duy nhất, tránh lặp cùng sản phẩm ở Flash sale và “Sản phẩm đang giảm giá”. Countdown chỉ hiện khi có chương trình với thời gian thật; hiện đang dùng mốc cố định.
6. Preorder: thời gian dự kiến, trạng thái rõ ràng và CTA riêng.
7. Cam kết cửa hàng: đóng gói, hỗ trợ, giao hàng; trình bày ngắn gọn.
8. Góc sưu tầm/review và một khối tin tức chọn lọc. Hiện có cả NewsHighlight và LatestNewsSection; gộp để trang bớt dài. Thẻ có nút play cần video hoạt động, nếu chỉ là bài viết thì dùng CTA đọc bài.
9. Thương hiệu và footer thông tin hỗ trợ.

FeaturedSeries/shortcut chỉ giữ khi dẫn tới tập sản phẩm rõ ràng; tránh quá nhiều lớp điều hướng trước khi thấy sản phẩm.

## 3. Hiệu ứng và trải nghiệm

- Hover thẻ nhẹ: nâng 2–4px, bóng mềm, chuyển tiếp 150–250ms. Không phóng ảnh quá mạnh hoặc làm xê dịch giá/nút.
- Nút mua có trạng thái đang xử lý và phản hồi thành công; giữ chiều rộng để không nhảy bố cục.
- Menu/dropdown chuyển tiếp ngắn, hỗ trợ bàn phím và focus rõ. Mobile không phụ thuộc hover.
- Skeleton đúng kích thước khung ảnh; ảnh ngoài màn hình tải trễ. Không cần thêm thư viện hiệu ứng chỉ để tạo hover.
- Tôn trọng `prefers-reduced-motion`; tránh autoplay carousel, parallax và hiệu ứng xuất hiện lặp mỗi lần cuộn.

## 4. Trình tự triển khai và nghiệm thu

| Ưu tiên | Công việc | Điều kiện nghiệm thu |
| --- | --- | --- |
| 1 | Chuẩn hóa màu, header, thẻ sản phẩm, sửa chữ “Khám phá” ở hero | Chữ dễ đọc, ảnh không bị cắt, CTA nhất quán |
| 2 | Sắp xếp lại trang chủ, gộp sale/tin tức, điều chỉnh hero mobile | Không lặp nội dung, khách thấy danh mục và sản phẩm sớm |
| 3 | Hoàn thiện trang chi tiết: thư viện ảnh, thông số, giao hàng, CTA | Nội dung hỗ trợ quyết định mua; không cần tìm nút mua |
| 4 | Thêm hiệu ứng và trạng thái tải/empty/error | Không giật bố cục, bàn phím và reduced motion hoạt động |
| 5 | Kiểm tra ở 360/390/768/1440px | Không cuộn ngang trang, không che nút, kiểm tra giỏ và checkout |

Không đặt số liệu tốc độ hay tỷ lệ chuyển đổi mục tiêu giả khi chưa có đo đạc. Chụp trước/sau trên cùng kích thước màn hình và kiểm tra hiệu năng sau khi thay ảnh.
