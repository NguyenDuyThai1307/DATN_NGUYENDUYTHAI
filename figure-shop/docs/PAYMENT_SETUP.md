# Cấu hình và vận hành thanh toán

> **10/09/2026 — chỉ dùng DEMO nội bộ:** local đã có APP_URL=http://localhost:3000, DEMO_PAYMENT_ENABLED=true, PAYOS_ENABLED=false, VNPAY_ENABLED=false. Không cần thực hiện hướng dẫn merchant/tunnel/scheduler phía dưới. Nội dung còn lại lưu cho trường hợp mở lại tích hợp cổng; việc đang cần làm nằm ở [CHECKLIST_AUDIT.md](CHECKLIST_AUDIT.md).

Cập nhật 09/09/2026. Đã triển khai mã nguồn, migration, UI và kiểm thử nội bộ. **Chưa nghiệm thu kết nối merchant thật hoặc giao dịch qua cổng thật** vì local chưa có thông tin kết nối.

## 1. Trạng thái hiện tại

- SDK `@payos/node` **2.0.5**, cố định trong package.json/lockfile.
- Đã áp dụng `20260909090000_online_payments` và `20260909093000_payment_cancel_request` vào SQLite local, sau khi sao lưu và thử trên bản sao.
- Backup đầu: `backups/before-online-payments-2026-09-09T14-21-29-476Z.db`; thư mục backups được Git ignore.
- `.env` được bổ sung biến còn thiếu, PAYOS/VNPAY đang tắt, DEMO bật để giữ luồng cũ. Không có khóa thật được ghi vào repo.
- Chưa đăng ký callback, chưa cài lịch vào Windows, chưa chuyển tiền hoặc hoàn tiền.

## 2. Cấu hình

Chạy lệnh từ thư mục `figure-shop`. Khi cài trên máy khác:

```powershell
npm.cmd ci
# Tạo .env từ .env.example nếu chưa có, không ghi đè cấu hình đang dùng.
npm.cmd run payment:backup
npx.cmd prisma migrate deploy
npx.cmd prisma generate
```

Backup dành cho database hiện có; máy mới chưa có database thì chạy migration tạo database trước. Không seed đè dữ liệu đang dùng.

| Biến | Ý nghĩa |
| --- | --- |
| `APP_URL` | Origin HTTPS khách truy cập, ví dụ `https://figure-shop.example`; local cho phép `http://localhost:3000` |
| `PAYOS_ENABLED` | Bật sau khi có khóa và callback |
| `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` | Ba khóa của kênh payOS |
| `PAYOS_TEST_ORDERS` | Giữ `true` khi demo; vẫn dùng tiền thật nhưng tách doanh thu |
| `VNPAY_ENABLED` | Bật khi có merchant Sandbox |
| `VNPAY_ENV` | Luôn `sandbox`; code từ chối giá trị khác |
| `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET` | Merchant Sandbox được cấp |
| `VNPAY_QUERY_IP` | IP máy chủ dùng QueryDr; loopback chỉ cho local/mock |
| `PAYMENT_CLIENT_IP_HEADER` | Header IP do reverse proxy tin cậy ghi đè, ví dụ `x-real-ip` |
| `DEMO_PAYMENT_ENABLED` | Bật demo local; tắt khi không muốn khách dùng DEMO |
| `PAYMENT_RESERVATION_MINUTES` | Mặc định 15, cho phép 5–60 và phải phù hợp merchant |

Khi chạy `next start`, API tạo thanh toán yêu cầu cấu hình header IP từ proxy. Không tin header IP do khách gửi trực tiếp. `next dev` local cho phép loopback.

Khi dùng tunnel, truy cập website qua đúng URL tunnel đã đặt trong APP_URL để kiểm tra Origin thành công. Restart ứng dụng sau khi đổi `.env`. Khóa chỉ ở server, không dùng tiền tố NEXT_PUBLIC_, không đưa vào chat/ảnh báo cáo. Endpoint payment/query VNPAY được cố định trong adapter ở Sandbox.

## 3. Kết nối payOS

1. Xác thực tài khoản/ngân hàng trên payOS và tạo kênh riêng cho dự án.
2. Điền ba khóa và APP_URL trong `.env`, khởi động server.
3. Khai báo webhook của kênh: `https://<host>/api/payment/payos/webhook` (POST).
4. Callback không cần cookie; gói kiểm tra kết nối có chữ ký hợp lệ nhưng không khớp attempt không tạo đơn hay ghi nhận tiền.
5. Bật PAYOS_ENABLED, giữ PAYOS_TEST_ORDERS=true trong giai đoạn đồ án.
6. Chủ tài khoản tự tạo đơn thử nhỏ phù hợp giới hạn cổng, kiểm tra thông tin rồi chuyển khoản. Kiểm tra đơn, sự kiện và giao dịch tại payOS cả khi không quay lại website.

payOS không có sandbox riêng. Test tự động dùng khóa giả/phản hồi giả lập có chữ ký, không gọi thu tiền thật. [Môi trường](https://payos.vn/docs/moi-truong-test/), [SDK](https://payos.vn/docs/sdks/back-end/node/), [API](https://payos.vn/docs/api/).

## 4. Kết nối VNPAY Sandbox

1. [Đăng ký merchant test](https://sandbox.vnpayment.vn/devreg/) và điền TmnCode/HashSecret.
2. Đăng ký IPN với VNPAY: `https://<host>/api/payment/vnpay/ipn` (GET).
3. Return URL ứng dụng tạo là `https://<host>/api/payment/vnpay/return`.
4. Bật VNPAY_ENABLED, restart, tạo đơn từ checkout; dùng thẻ/OTP thử nghiệm do Sandbox cung cấp tại thời điểm test.
5. Test thành công, hủy, hết hạn, return trước IPN và mở lại lịch sử đơn sau khi đóng tab cổng.

Adapter dùng VND nhân 100, GMT+7, HMAC-SHA512; QueryDr có chuỗi ký riêng và kiểm tham chiếu/chữ ký phản hồi. Mỗi attempt truy vấn VNPAY tối đa một lần trong 5 phút. Trạng thái đảo giao dịch/hoàn tiền/nghi ngờ giữ cần đối soát. [Thanh toán](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html), [QueryDr](https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr%26refund.html).

## 5. Đối soát định kỳ

```powershell
npm.cmd run payment:reconcile
```

Một lượt tối đa 50 đơn, xoay vòng theo updatedAt. Lease 60 giây ngăn nhiều tiến trình truy vấn cùng attempt; mạng timeout 10 giây. Query payOS cách nhau ít nhất 30 giây, VNPAY 5 phút. Không dùng timer trong request Next.js.

Sau khi cấu hình merchant và kiểm tra một lượt thủ công, cài lịch Windows:

```powershell
.\scripts\install-payment-scheduler.ps1
Get-ScheduledTaskInfo -TaskName FigureShop-PaymentReconciliation
```

Script tạo tác vụ mỗi 5 phút dưới user hiện tại, chạy khi user đăng nhập, không ghi khóa vào task và không ghi đè tác vụ trùng tên. Nếu deploy host khác, dùng scheduler của host chạy cùng npm script; SQLite phải nằm trên ổ đĩa bền vững. Lịch trên máy local không thay thế lịch server public.

## 6. Xử lý ngoại lệ

| Tình huống | Hành vi / cách xử lý |
| --- | --- |
| Tạo link timeout | Giữ UNKNOWN và cùng tham chiếu; kiểm tra lại hoặc đợi job, không tạo khoản thu mới |
| Bấm hủy | Lưu cancelRequestedAt, chặn thanh toán mới; đối soát và hủy link nếu cổng hỗ trợ |
| VNPAY hủy | Không có API đóng link tương đương payOS trong bản tích hợp này; đợi kết quả kết thúc được xác minh |
| Hết hạn nhưng chưa rõ tiền | Giữ hàng và cảnh báo dashboard; admin kiểm tra merchant và liên hệ khách, không sửa DB tùy ý |
| Tiền đến sau khi hủy | Ghi PAID, giữ CANCELLED và cần đối soát, không tự giao hàng |
| Thiếu/thừa/nhiều khoản chuyển | Lưu từng sự kiện, cảnh báo; chưa tự cộng khoản lẻ hoặc tự hoàn tiền |
| Tạm dừng cổng | Tắt tạo mới bằng cờ, giữ khóa/callback cho giao dịch cũ |
| Đổi merchant/key | Phải xử lý attempt cũ trước; chưa hỗ trợ kho khóa nhiều phiên bản |

Chi tiết tại `/admin/orders/[id]`: môi trường, mã tham chiếu, attempt, sự kiện và nguyên nhân cần đối soát. Dashboard tách doanh thu thực, Sandbox, Demo, đơn thử tiền thật và LEGACY. UI xử lý dứt điểm ngoại lệ thủ công và hoàn tiền tự động chưa có trong phiên bản này.

## 7. Kiểm thử

```powershell
npm.cmd run test:payment
npm.cmd run test:smoke
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
npm.cmd run test:payment:http
```

- `test:payment`: DB mới trong `.payment-test/`, 16 nhóm test service/provider, không gọi mạng thật.
- `test:payment:http`: dùng bản build hiện tại, DB/server riêng trên cổng trống; kiểm callback/auth/CSRF/idempotency/return và trang kết quả, tự dừng server.
- `test:smoke`: bản sao database local, regression admin/khuyến mãi/giỏ hàng/checkout/DEMO.
- Đã kiểm migration giữ nguyên cột dữ liệu cũ, số bản ghi và khóa ngoại trên bản sao.
- Chưa kiểm trực quan desktop/mobile: Browser runtime không có trình duyệt kết nối.
- Chưa test merchant thật, HTTPS tunnel, callback từ nhà cung cấp hoặc scheduler đã đăng ký. Chỉ nghiệm thu sau khi chạy thực tế.

Pre-order hiện thu đủ giá trị đơn; chưa hỗ trợ đặt cọc/đổi cổng trên cùng đơn. COD/chuyển khoản thủ công không chịu thời hạn online. Đơn tổng 0 không gọi cổng và không sinh mã giao dịch ngân hàng.
