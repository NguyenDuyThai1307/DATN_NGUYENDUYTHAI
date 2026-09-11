# Kế hoạch tích hợp payOS và VNPAY Sandbox

> **Phạm vi mới 10/09/2026:** chỉ DEMO nội bộ. Tài liệu này được giữ làm lịch sử thiết kế/triển khai; các checkbox merchant, HTTPS, giao dịch thật và scheduler chưa hoàn thành dưới đây đã chuyển sang **ngoài phạm vi**, không phải việc người dùng còn phải làm. Checklist hiện hành: [CHECKLIST_AUDIT.md](CHECKLIST_AUDIT.md).

Ngày lập: 07/09/2026. Dự án: Figure Shop. Mốc code tham chiếu: `b5f08fb`.

Rà soát bổ sung: 09/09/2026, HEAD vẫn là `b5f08fb`. Đã đọc lại schema, order/payment/pricing service, checkout, API tạo đơn, proxy, đăng nhập và thống kê admin; đối chiếu lại tài liệu chính thức payOS và VNPAY. Phần 10 bổ sung các quyết định kỹ thuật cần đưa vào từng lượt triển khai.

**Trạng thái 09/09/2026: đã triển khai nền tảng, adapter payOS/VNPAY Sandbox, API, UI, migration và kiểm thử nội bộ. Chưa nghiệm thu kết nối merchant thật, giao dịch qua cổng, scheduler hay giao diện bằng trình duyệt.** Phần 1–10 lưu thiết kế ban đầu; phần 11 ghi kết quả thực hiện. Xem [hướng dẫn cấu hình hiện tại](PAYMENT_SETUP.md).

## 1. Mục tiêu và phạm vi

- payOS: nhận thanh toán chuyển khoản QR thực tế, tự động đối chiếu với đơn hàng.
- VNPAY Sandbox: trình diễn luồng cổng thanh toán bằng tài khoản/thẻ thử nghiệm cho khóa luận.
- Giữ COD, chuyển khoản thủ công và thanh toán demo đang có; mỗi phương thức được bật theo môi trường sử dụng.
- Tái sử dụng `Order`, `OrderItem`, `Payment`, JWT, Prisma và pricing service; tiếp tục dùng SQLite cho local.
- Giai đoạn đầu thu đủ tổng giá trị đơn, kể cả đơn pre-order. Đặt cọc, nhiều đợt thanh toán, trả góp và hoàn tiền tự động nằm ngoài phạm vi này.
- Không trộn một lần thanh toán giữa hai cổng. Mỗi đơn chọn một phương thức; muốn đổi cổng phải đóng các yêu cầu cũ, đối soát và tạo đơn mới trong phiên bản đầu.

### Phân biệt môi trường

| Nội dung | payOS | VNPAY Sandbox |
| --- | --- | --- |
| Mục đích trong đồ án | Trình diễn chuyển khoản thực tế | Kiểm thử luồng thanh toán giả lập |
| Chuẩn bị | Tài khoản đã định danh, ngân hàng được hỗ trợ, kênh thanh toán | Đăng ký merchant test và lấy thông tin kết nối |
| Nhận kết quả | Webhook và truy vấn phía server | IPN và truy vấn phía server |
| Nhãn trong giao diện đồ án | Chuyển khoản QR qua payOS | VNPAY - Thử nghiệm |
| Ghi nhận báo cáo | Giao dịch thực tế, tách đơn dùng để thử | Giao dịch thử nghiệm, không cộng vào doanh thu thực |

payOS hiện không có sandbox riêng; cần CCCD và tài khoản ngân hàng cá nhân phù hợp để thử với số tiền thật nhỏ. Không tạo biến `PAYOS_SANDBOX` hoặc trình bày payOS như giao dịch giả lập. [Tài liệu môi trường payOS](https://payos.vn/docs/moi-truong-test/).

VNPAY cung cấp đăng ký merchant test. Thông tin kết nối lấy từ tài khoản/email được cấp, không dùng khóa sao chép từ ví dụ trên mạng. [Đăng ký VNPAY Sandbox](https://sandbox.vnpayment.vn/devreg/).

Các quyết định về database, API nội bộ, thời hạn giữ hàng và giao diện trong tài liệu là đề xuất riêng cho Figure Shop, không phải yêu cầu bắt buộc của nhà cung cấp.

## 2. Hiện trạng đã kiểm tra trong project

| Thành phần hiện có | Hành vi hiện tại | Việc cần bổ sung |
| --- | --- | --- |
| `prisma/schema.prisma` | `PaymentMethod`: COD, BANK_TRANSFER, DEMO; một `Payment` cho mỗi `Order` | PAYOS, VNPAY và lịch sử lần thanh toán |
| `src/services/order.service.ts` | Server tính giá; tạo đơn/payment, trừ tồn kho, tăng lượt coupon và xóa giỏ trong transaction | Chống tạo đơn lặp; theo dõi giữ hàng, hết hạn, hoàn lượt coupon |
| `src/services/payment.service.ts` | Thanh toán demo cập nhật `Payment` và `Order` thành công | Xác nhận có kiểm chứng từ nhà cung cấp, dùng chung cho hai cổng |
| `src/app/api/orders/route.ts` | Tạo đơn rồi trả JSON về client | Tiếp tục trả đơn; client tạo yêu cầu thanh toán trên chính đơn đó |
| `src/components/checkout/CheckoutForm.tsx` | Tạo đơn xong chuyển thẳng tới `/checkout/success` | Nhánh online chuyển tới cổng thanh toán, hỗ trợ tiếp tục trả tiền |
| `src/proxy.ts` | Bảo vệ account/cart/checkout/admin, không match callback API | Giữ callback công khai và xác minh chữ ký tại API |
| `src/services/admin.service.ts` | Tổng doanh thu lấy mọi đơn có `paymentStatus = PAID` | Phân biệt doanh thu thực, DEMO và SANDBOX |
| `scripts/smoke-test.ts` | Kiểm thử service với bản sao database tạm | Thêm kiểm thử callback HTTP, concurrency và retry |

Điểm cần giải quyết trước khi nối cổng: đơn chưa thanh toán đã làm giảm tồn kho và sử dụng coupon. Không được chỉ thêm nút QR rồi để đơn bỏ dở giữ hàng vô thời hạn.

## 3. Chuẩn bị tài khoản và môi trường

### Chủ dự án chuẩn bị

- [ ] Tạo tài khoản payOS, hoàn tất định danh trên hệ thống của nhà cung cấp.
- [ ] Kiểm tra ngân hàng chính chủ được hỗ trợ ở thời điểm đăng ký, liên kết tài khoản nhận tiền.
- [ ] Tạo kênh thanh toán dành riêng cho project; lưu Client ID, API Key, Checksum Key trong `.env` local.
- [ ] Đăng ký VNPAY Sandbox, nhận TmnCode và HashSecret; kiểm tra quyền dùng IPN/truy vấn.
- [ ] Chuẩn bị địa chỉ HTTPS công khai, ổn định cho callback; có thể dùng tunnel trỏ về local để test.
- [ ] Thống nhất số tiền nhỏ và tài khoản thực hiện giao dịch thử payOS; chủ dự án trực tiếp xác nhận chuyển tiền.

Không đưa CCCD, thông tin đăng nhập ngân hàng hoặc khóa vào tài liệu, ảnh chụp báo cáo hay Git. Nếu URL tunnel thay đổi, cập nhật cả cấu hình ứng dụng và callback đã đăng ký.

### Cấu hình đề xuất

Đây là mẫu cho lần triển khai sau, chưa thêm vào `.env.example` trong lượt lập kế hoạch này:

```dotenv
APP_URL=https://your-public-host.example
PAYOS_ENABLED=false
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
VNPAY_ENABLED=false
VNPAY_ENV=sandbox
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_QUERY_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
DEMO_PAYMENT_ENABLED=true
PAYMENT_RESERVATION_MINUTES=15
```

- Các khóa không dùng tiền tố `NEXT_PUBLIC_`. Client chỉ nhận danh sách phương thức khả dụng và URL thanh toán của đơn thuộc về mình.
- Hai endpoint VNPAY trên thuộc môi trường sandbox; cấu hình production không nằm trong kế hoạch này. [Cấu hình VNPAY](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html).
- Tạo URL return/cancel từ `APP_URL` đã cấu hình, không tin URL do client hoặc header Host tùy ý gửi lên.
- Chỉ khởi tạo client cổng khi cần; build và COD vẫn hoạt động khi chưa có khóa. Nếu đã bật cổng nhưng thiếu khóa, báo lỗi cấu hình rõ ràng phía server.
- Bật/tắt phương thức áp dụng cho yêu cầu mới; callback của yêu cầu đang tồn tại vẫn phải được xử lý.
- Local tiếp tục dùng SQLite. Khi triển khai public, chọn nơi có ổ đĩa lưu bền vững; không đặt database SQLite ghi được trên filesystem tạm rồi kỳ vọng dữ liệu tồn tại sau redeploy.

## 4. Thiết kế dữ liệu và trạng thái

### 4.1. Mở rộng có migration

Giữ `Order.payment` một-một để các màn hình hiện tại ít thay đổi. Thêm `PaymentAttempt` một-nhiều dưới `Payment`, vì một đơn có thể có lần thử thất bại rồi thanh toán lại.

| Đối tượng | Trường đề xuất | Mục đích |
| --- | --- | --- |
| `PaymentMethod` | Thêm `PAYOS`, `VNPAY` | Phân biệt cổng với chuyển khoản thủ công |
| `Payment` | `environment`: LEGACY/DEMO/SANDBOX/LIVE; `needsReview` | Tách báo cáo và xử lý ngoại lệ |
| `PaymentAttempt` | `id`, `paymentId`, `provider`, `environment`, `amount`, `currency` | Snapshot của lần thanh toán |
| `PaymentAttempt` | `providerReference` duy nhất theo cổng/môi trường; `providerPaymentId` | Ánh xạ mã gửi đi và mã cổng trả về |
| `PaymentAttempt` | `status`, `checkoutUrl`, `expiresAt`, `createdAt`, `updatedAt` | Tiếp tục thanh toán và theo dõi vòng đời |
| `PaymentAttempt` | `activePaymentId` nullable unique | Tối đa một attempt còn mở trên một Payment; SQLite cho phép nhiều giá trị null |
| `PaymentAttempt` | `requestKey` unique | Bấm lặp hoặc retry HTTP không tạo lần trả tiền mới |
| `PaymentEvent` | `attemptId`, `eventKey`, `providerTransactionId`, `receivedAt`, `processedAt`, `result`, dữ liệu đối soát tối thiểu | Dedupe thông báo, lưu dấu vết sự kiện |
| `Order` | `checkoutKey` unique theo user; `checkoutPayloadHash` | Retry tạo đơn trả về đơn cũ; cùng key nhưng nội dung khác trả lỗi |
| `Order` | `paymentExpiresAt`, `reservationReleasedAt`, `isTestOrder` | Hết hạn giữ hàng, hoàn kho một lần, phân loại đơn thử |
| `OrderItem` | `reservedQuantity` | Snapshot lượng hàng đã trừ; không suy luận từ loại sản phẩm có thể đổi sau này |

`PaymentAttempt.status` dự kiến: `CREATING`, `PENDING`, `UNKNOWN`, `SUCCEEDED`, `FAILED`, `CANCELLED`, `EXPIRED`. `UNKNOWN` dùng khi gọi cổng bị timeout và chưa biết yêu cầu đã được tạo/thanh toán hay chưa.

Giữ `PaymentStatus` tổng hợp hiện có cho tương thích. Khi còn khả năng thanh toán, đơn giữ `UNPAID`; thất bại một attempt không có nghĩa cả đơn đã hủy. Lịch sử attempt thể hiện chi tiết cho UI.

Migration phải giữ nguyên dữ liệu cũ. Backfill DEMO theo phương thức; COD/BANK_TRANSFER cũ để `LEGACY` chờ phân loại, không tự khẳng định là doanh thu tiền thật. Không sửa migration đã chạy; sao lưu database và thử migration trên bản sao trước.

Mã cổng không dùng trực tiếp `orderNumber` dạng `FS-...` cho mọi nhà cung cấp. Adapter sinh mã đúng giới hạn cổng, lưu trước khi gửi request và có unique constraint; mã số phải nằm trong miền số nguyên an toàn của JavaScript. Không dùng riêng `Date.now()` như bảo đảm duy nhất.

### 4.2. Quy tắc xử lý chung

1. Tổng tiền được tính từ server khi tạo đơn, đóng băng trong Order/Payment. Client không được quyết định số tiền gửi sang cổng.
2. Tạo attempt và chốt mã tham chiếu trong transaction ngắn; gọi API bên ngoài sau khi transaction kết thúc; cập nhật kết quả bằng transaction tiếp theo.
3. Request thanh toán lặp trả lại link còn dùng được. Khi không rõ kết quả lần tạo link trước, truy vấn mã đã lưu trước khi cho tạo lần khác.
4. Chỉ xác nhận trả tiền từ callback đã kiểm chữ ký hoặc truy vấn server-to-server đã kiểm tính xác thực; đối chiếu cổng, môi trường, merchant, mã đơn, số tiền và tiền tệ.
5. `Return URL` chỉ đưa khách trở lại giao diện. Query `status=PAID`, ảnh chuyển khoản hoặc nút xác nhận của khách không phải bằng chứng thanh toán.
6. Cùng một transaction cập nhật event, attempt, Payment và Order. Dùng conditional update/unique constraint để hai callback đồng thời chỉ tạo một lần chuyển trạng thái.
7. Đơn `PENDING` được chuyển `CONFIRMED` sau thanh toán thành công. Không làm lùi đơn đã `PROCESSING`, `SHIPPED`, `COMPLETED`; `PAID` không bị callback thất bại đến sau đổi ngược.
8. Callback hợp lệ về giao dịch khác của đơn đã trả tiền phải lưu để đối soát trùng thanh toán, không bỏ qua như một bản gửi lặp.
9. Đơn tổng 0 không gửi sang cổng; xử lý riêng như đơn không cần thu tiền, không giả lập mã giao dịch ngân hàng. Khóa bằng test trước khi bật online.
10. Đơn test payOS vẫn là tiền thật: lưu `environment=LIVE` và `isTestOrder=true`, phân biệt với giả lập DEMO/SANDBOX.

### 4.3. Hủy, hết hạn, tồn kho và coupon

- Phiên bản đầu giữ cách trừ hàng khi tạo đơn như một lượt giữ chỗ. Với online, hạn đề xuất 15 phút; thời hạn cụ thể gửi cổng phải hợp lệ theo cấu hình merchant.
- Lưu `reservedQuantity` cho hàng IN_STOCK; pre-order không giữ kho. Khi tạo đơn dùng cập nhật có điều kiện `stock >= quantity` để chống hai khách lấy cùng số hàng cuối.
- Giữ một lượt coupon trong transaction tạo đơn bằng cập nhật có điều kiện giới hạn sử dụng; không tăng thêm khi nhận thông báo thanh toán.
- Khách đóng tab hoặc bấm quay lại không tự động hủy đơn. Cho tiếp tục thanh toán trên đơn hiện có trước hạn, không tạo lại giỏ/đơn.
- Trước khi hủy/hết hạn, đối soát attempt còn mở. Chỉ giải phóng khi không có thanh toán thành công và yêu cầu cũ đã ở trạng thái kết thúc được kiểm chứng. Timeout truy vấn giữ trạng thái chờ đối soát, không đoán là thất bại.
- Hủy đơn chưa trả tiền cập nhật có điều kiện cùng transaction: đánh dấu CANCELLED, hoàn đúng `reservedQuantity`, hoàn lượt coupon đã giữ và ghi `reservationReleasedAt`. Chạy lặp không hoàn hai lần.
- Thông báo thành công tới sau khi đã hoàn kho vẫn phải ghi nhận tiền đã nhận và đặt `needsReview`; không tự phục hồi đơn hoặc giao hàng khi chưa kiểm tra tồn kho.
- Tiền thiếu/thừa, không khớp mã hoặc chuyển trùng cần lưu dấu vết tối thiểu để admin đối soát. Chưa tự cộng nhiều khoản chuyển lẻ hoặc tự hoàn tiền.
- Có script đối soát/hết hạn chạy bằng Windows Task Scheduler hoặc scheduler của host; không dùng `setTimeout` trong Next.js để giữ lịch. Nhịp đề xuất 1-5 phút, giới hạn batch và có retry/backoff.
- Đơn cũ, COD và chuyển khoản thủ công không bị áp thời hạn online mặc định.

## 5. API và file dự kiến

### API nội bộ dùng chung

| Endpoint đề xuất | Quyền | Hành vi |
| --- | --- | --- |
| `POST /api/orders` | User đăng nhập | Nhận checkout key, tạo đơn idempotent, trả orderId |
| `POST /api/payment/requests` | Chủ đơn | Tạo/tiếp tục attempt theo phương thức đã lưu của đơn |
| `GET /api/payment/orders/[orderId]` | Chủ đơn hoặc staff/admin | Trả trạng thái an toàn từ database, không trả khóa/payload nhạy cảm |
| `POST /api/payment/orders/[orderId]/refresh` | Chủ đơn hoặc staff/admin | Truy vấn cổng để đối soát, giới hạn tần suất |
| `POST /api/payment/orders/[orderId]/cancel` | Chủ đơn hoặc staff/admin theo trạng thái | Yêu cầu đóng attempt, xác minh và hủy đơn đủ điều kiện |
| `POST /api/payment/payos/webhook` | Công khai, chữ ký payOS | Nhận kết quả server-to-server |
| `GET /api/payment/vnpay/ipn` | Công khai, chữ ký VNPAY | Nhận kết quả server-to-server và trả ACK theo đặc tả |
| `GET /api/payment/vnpay/return` | Công khai, không lộ thông tin đơn | Kiểm tham số và đưa về trang kết quả; không dùng để xác nhận tiền |
| `/checkout/payment-result?orderId=...` | Chủ đơn | Trang kết quả dùng dữ liệu server; hết phiên thì đăng nhập lại |

payOS return/cancel có thể cùng trỏ tới trang kết quả có orderId; giao diện xử lý khác nhau nhưng không cập nhật thanh toán từ query. Callback không cần cookie của khách. API tạo/refresh/cancel phải tự kiểm JWT, quyền sở hữu và origin cho thao tác dùng cookie.

### Phân chia file

| Nhóm | File/đường dẫn dự kiến |
| --- | --- |
| Database | `prisma/schema.prisma`, migration mới |
| Cấu hình | `.env.example`, `src/lib/payment-config.ts` |
| Adapter | `src/services/payment/payos.provider.ts`, `vnpay.provider.ts` |
| Điều phối | Mở rộng `src/services/payment.service.ts`; `payment-event.service.ts`, `payment-reconciliation.service.ts` nếu cần tách |
| Kiểu/validation | `src/types/payment.ts`, `src/validations/payment.schema.ts`, mở rộng `order.schema.ts` |
| Đặt hàng | `src/services/order.service.ts`, `src/app/api/orders/route.ts` |
| Callback/API | Các thư mục dưới `src/app/api/payment/` theo bảng endpoint |
| UI | `CheckoutForm.tsx`, trang success hiện có, trang payment-result, nút tiếp tục thanh toán ở chi tiết đơn |
| Admin | Chi tiết đơn, bảng đơn, `src/services/admin.service.ts`, badge trạng thái |
| Test/đối soát | `scripts/payment-test.ts`, `scripts/payment-http-test.ts`, `scripts/reconcile-payments.ts`, mở rộng smoke test |

## 6. Bốn lượt triển khai

Đây là bốn lượt riêng cho thanh toán, không phải các lượt frontend cũ. Làm và nghiệm thu từng lượt; cập nhật trạng thái ở cuối tài liệu sau mỗi mốc.

### Lượt TT1: Nền tảng thanh toán và migration

Thứ tự thực hiện:

1. Xác nhận schema đề xuất với kiểu dữ liệu hiện tại; thêm phương thức, môi trường, attempt/event và trường giữ hàng.
2. Tạo migration giữ nguyên dữ liệu, backfill rõ nguồn dữ liệu cũ; thử trên database sao chép.
3. Bổ sung checkout key, kiểm tra request lặp và snapshot tồn kho/coupon.
4. Tạo hàm dùng chung cho tạo attempt, xác nhận, đối soát và hủy; adapter giả chỉ dùng trong test.
5. Thêm cờ bật cổng phía server; DEMO chỉ hiện khi cấu hình cho phép và chỉ xác nhận đúng đơn DEMO.
6. Viết kiểm thử transaction, chuyển trạng thái, callback lặp, giữ/hoàn kho; bảo đảm COD/BANK_TRANSFER/DEMO vẫn chạy.

Nghiệm thu: không mất đơn/payment cũ; hai lần submit trả một đơn; callback lặp không nhân đôi tác động; request giả sửa amount không được chấp nhận. Chưa cần khóa thật để hoàn thành TT1.

### Lượt TT2: payOS

SDK chính thức dùng gói `@payos/node`, khởi tạo bằng Client ID/API Key/Checksum Key; có `paymentRequests.create()` và `webhooks.verify()`. Chốt phiên bản khi triển khai và kiểm tra API của phiên bản đó. [SDK Node.js](https://payos.vn/docs/sdks/back-end/node/).

Thứ tự thực hiện:

1. Cài SDK, thêm adapter server-only, cấu hình timeout và log đã lọc thông tin riêng tư.
2. Tạo payment link với mã attempt và số tiền snapshot; lưu ID/link/hạn dùng. Tên hàng và nội dung gửi ra cổng chỉ gồm phần cần thiết, tuân thủ giới hạn chuỗi hiện hành.
3. Khi API timeout, đánh dấu UNKNOWN; truy vấn mã cũ để phục hồi link/trạng thái, tránh tạo khoản thu mới ngay.
4. Thêm webhook POST, xác minh chữ ký bằng SDK rồi chuyển dữ liệu đã xác thực cho service chung.
5. Đăng ký webhook với kênh payOS; nhận diện gói kiểm tra kết nối để không coi như một đơn mua hàng thật.
6. Xử lý phản hồi nhận webhook và lỗi database đúng cách: chỉ báo đã xử lý khi dữ liệu đã lưu bền vững; ghi nhận bản gửi lặp an toàn. payOS dùng phản hồi 2XX để xác nhận nhận webhook. [Đặc tả webhook](https://payos.vn/docs/du-lieu-tra-ve/webhook/).
7. Thêm truy vấn trạng thái và hủy link theo API SDK đã chốt; nối vào service đối soát chung.
8. Nối checkout sang trang thanh toán do payOS cung cấp trước; chưa nhúng iframe hoặc tự dựng QR ở phiên bản đầu.
9. Giao diện quay lại đọc trạng thái server và có nút kiểm tra lại. payOS điều hướng bằng `returnUrl`/`cancelUrl` cùng query mô tả kết quả; không lấy query làm nguồn xác nhận trong ứng dụng. [Return URL](https://payos.vn/docs/du-lieu-tra-ve/return-url/).
10. Kiểm thử giả lập trước; chủ dự án thực hiện một giao dịch thật nhỏ trên đơn test riêng khi kết nối đã sẵn sàng. Test tự động mặc định không gọi payOS thật.

Nghiệm thu: chuyển khoản xong cập nhật đúng một đơn và đúng số tiền dù khách không quay lại trang; refresh không tạo link mới; callback sai không thay đổi dữ liệu; giao dịch thật khớp trên trang quản lý payOS.

Nếu tài khoản/khóa chưa sẵn sàng, chỉ đánh dấu code và mock test đã xong. Mục kiểm thử kết nối thật giữ chưa hoàn thành.

### Lượt TT3: VNPAY Sandbox

Thứ tự thực hiện:

1. Cấu hình merchant test, URL payment/query sandbox và IPN HTTPS công khai.
2. Tạo URL thanh toán từ attempt đã lưu. Dùng `vnp_TxnRef` ổn định, amount nguyên VND nhân 100; lưu `vnp_CreateDate` để phục vụ đối soát.
3. Thực hiện đúng quy tắc sắp xếp/encode tham số và HMAC-SHA512 phiên bản 2.1.0, dùng `node:crypto`; so sánh chữ ký an toàn. [Hướng dẫn thuật toán VNPAY](https://sandbox.vnpayment.vn/apis/docs/chuyen-doi-thuat-toan/changeTypeHash.html).
4. Format thời gian theo múi giờ GMT+7 một cách tường minh; không phụ thuộc timezone của máy deploy. [Đặc tả truy vấn](https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr&refund.html).
5. Viết IPN GET: kiểm chữ ký, TmnCode, TxnRef, amount, response/transaction status; chỉ ghi thành công khi các mã thành công hợp lệ. Trả `RspCode`/`Message` theo bảng chính thức cho thành công, đã xử lý, không tìm thấy đơn, sai số tiền/chữ ký. Return và IPN có vai trò riêng. [Tích hợp PAY](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html).
6. Viết return route để chuyển tới trang kết quả; IPN có thể tới trước hoặc sau return nên UI có trạng thái chờ.
7. Tích hợp QueryDr server-to-server để kiểm tra giao dịch chưa rõ kết quả; giữ nguyên tham chiếu/thời gian lần tạo. Chữ ký querydr theo đặc tả riêng, không tái dùng nguyên chuỗi ký URL payment. [API QueryDr](https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr&refund.html).
8. Chạy các kịch bản thành công, từ chối/hủy, chậm IPN, retry và sai chữ ký bằng dữ liệu test chính thức tại thời điểm triển khai; không dùng thẻ thật.

Nghiệm thu: đặt đơn từ website qua cổng sandbox, callback cập nhật đúng; lưu `environment=SANDBOX`; dashboard không cộng vào doanh thu thực. Không đổi sang endpoint VNPAY production trong lượt này.

### Lượt TT4: UX, đối soát và nghiệm thu toàn luồng

1. Checkout hiển thị các phương thức khả dụng từ server. payOS và VNPAY Sandbox có nhãn phân biệt rõ; DEMO bị ẩn khi cấu hình tắt.
2. Disable nút trong lúc gửi, giữ checkout key qua lần retry của cùng nội dung; tạo đơn xong nhưng không lấy được link vẫn có đường về chi tiết đơn để tiếp tục.
3. Trang kết quả hỗ trợ: đã trả tiền, đang xác nhận, chưa trả tiền/hủy thao tác, hết hạn và cần đối soát. Dừng polling khi có kết quả hoặc quá thời gian chờ; chuyển sang nút kiểm tra lại.
4. Tại `/account/orders/[id]`, cho tiếp tục trả tiền/kiểm tra trạng thái của đơn thuộc user, không yêu cầu tạo lại giỏ hàng.
5. Admin xem cổng, môi trường, các attempt, transaction ID, thời điểm xác nhận và ngoại lệ. Không thêm nút tùy ý đánh dấu PAID cho PAYOS/VNPAY.
6. Tách doanh thu LIVE, DEMO/SANDBOX, đơn test tiền thật và LEGACY chưa phân loại; không để số liệu giả lập trộn vào doanh thu thực.
7. Tạo script đối soát theo batch, chạy thử trên đơn hết hạn và tái chạy để kiểm tra không hoàn kho/coupon hai lần. Thiết lập scheduler khi deploy; không để thành việc thủ công không có lịch.
8. Bổ sung cách xử lý tiền đến muộn/trùng/thiếu: admin được thông báo cần kiểm tra; hoàn tiền thật xử lý thủ công bên ngoài, chỉ ghi REFUNDED khi có bằng chứng hoàn tiền.
9. Chạy kiểm thử bảo mật API, service, HTTP và trình duyệt desktop/mobile; ghi kết quả từng ca.
10. Chụp minh chứng khóa luận không chứa khóa hoặc dữ liệu ngân hàng nhạy cảm; cập nhật roadmap và hướng dẫn vận hành.

Nghiệm thu: thành công cả payOS thật có kiểm soát và VNPAY Sandbox; kho, coupon, trạng thái đơn, tài khoản và báo cáo nhất quán; có hướng xử lý khi callback/network gặp lỗi.

## 7. Ma trận kiểm thử bắt buộc

Tất cả ca dưới đây đang ở trạng thái **chưa chạy** cho hai cổng mới. Test service dùng database tạm; HTTP/E2E dùng server riêng với database test, không tự tạo đơn vào database đang dùng của shop.

| ID | Kịch bản | Kết quả cần đạt |
| --- | --- | --- |
| P01 | Thiếu khóa, cổng tắt | Không cho tạo request mới; COD vẫn hoạt động |
| P02 | Chưa đăng nhập / dùng ID đơn người khác | 401/403/404 phù hợp, không lộ chi tiết |
| P03 | Sửa amount/provider từ client | Server lấy theo snapshot và phương thức đã lưu |
| P04 | Hai submit checkout đồng thời / mất response rồi gửi lại | Một đơn, một lần giữ kho/coupon |
| P05 | Hai lần tạo thanh toán đồng thời | Một attempt còn mở, trả lại cùng link |
| P06 | Callback chữ ký giả / sai merchant, môi trường, amount | Không ghi PAID |
| P07 | Callback hợp lệ thành công | Payment/Order/Event cập nhật cùng transaction |
| P08 | Callback trùng hoặc tới đồng thời | ACK đúng, không tăng doanh thu/giảm kho lần hai |
| P09 | Return tới trước callback hoặc callback không tới | Hiện chờ; truy vấn cổng phục hồi trạng thái |
| P10 | Sửa query return thành PAID | Không thay đổi trạng thái server |
| P11 | Đóng tab, quay lại, hết phiên đăng nhập | Tiền vẫn xác nhận qua callback; xem đơn sau đăng nhập |
| P12 | Tạo link timeout, không rõ kết quả | UNKNOWN; truy vấn mã cũ, không tạo link trùng |
| P13 | Hủy/hết hạn, chạy job hai lần | Hoàn kho/coupon một lần sau đối soát |
| P14 | Thành công tới sau khi hoàn kho | Ghi nhận tiền và needsReview; không tự giao hàng |
| P15 | Thất bại tới sau thành công | Không hạ PAID hoặc làm lùi trạng thái đơn |
| P16 | Hai giao dịch khác nhau trả cùng đơn | Lưu khoản thứ hai để đối soát, không cộng doanh thu đơn hai lần |
| P17 | Chuyển thiếu/thừa, mã không khớp | Cần đối soát; không tự xác nhận đơn sai |
| P18 | Kho còn 1, hai khách đặt; coupon còn 1 lượt | Không bán quá kho/giới hạn coupon |
| P19 | Giá/khuyến mãi đổi sau tạo đơn | Thanh toán theo snapshot còn hiệu lực của đơn |
| P20 | Giảm 100%, total bằng 0 | Luồng không cần thu tiền, không gọi cổng với amount 0 |
| P21 | Giỏ hàng mixed IN_STOCK/PREORDER | Giữ/hoàn đúng hàng có sẵn, không trừ kho preorder |
| P22 | payOS LIVE test và VNPAY SANDBOX cùng PAID | Báo cáo phân loại đúng, không gộp doanh thu thực |
| P23 | DEMO gọi vào đơn online / cờ DEMO tắt | Từ chối xác nhận |
| P24 | Restart app/đổi tunnel khi đang thanh toán | Attempt giữ trong DB; đối soát/callback hoạt động khi khôi phục cấu hình |
| P25 | Desktop/mobile, thanh toán lại, lỗi API | Text/nút rõ ràng, không tạo đơn lặp, trạng thái pending có lối thoát |

Lệnh kiểm tra hiện có: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run test:smoke`, `npm.cmd run build`. Script `test:payment` và `test:payment:http` sẽ được thêm khi triển khai, không giả định đã tồn tại.

Kiểm thử giả lập tách biệt với kiểm thử cổng thật. Mock pass không đủ đánh dấu payOS/VNPAY kết nối thành công. Ghi ngày chạy, môi trường, mã đơn test, kết quả mong đợi/thực tế và lỗi còn lại; không đưa thông tin xác thực vào log.

## 8. Thứ tự, ước lượng và điểm dừng

| Mốc | Đầu ra | Ước lượng công việc |
| --- | --- | --- |
| Chuẩn bị | Tài khoản, khóa local, URL callback | Phụ thuộc thời gian định danh/cấp quyền |
| TT1 | Database, orchestration, giữ/hoàn hàng, mock test | 1-2 ngày |
| TT2 | payOS link/webhook/query và thử tiền thật nhỏ | 1-2 ngày sau khi có tài khoản |
| TT3 | VNPAY Sandbox URL/IPN/return/query | 1-2 ngày sau khi được cấp kết nối |
| TT4 | UX, đối soát định kỳ, E2E, báo cáo | 1-2 ngày |

Đây là ước lượng, không phải thời hạn cam kết. Chủ dự án có thể chuẩn bị hai tài khoản song song. Thứ tự mặc định: TT1 → TT2 → TT3 → TT4; nếu payOS đang chờ định danh thì TT3 có thể làm sau TT1, trước lần thử payOS thật. Không bật thu tiền thật trước khi các test nền tảng đã qua.

Khi cần dừng: tắt tạo thanh toán mới bằng cờ tương ứng nhưng tiếp tục callback/đối soát cho attempt cũ. Giữ dữ liệu sự kiện và migration; không xóa lịch sử để quay về demo.

## 9. Theo dõi tiến độ

- [x] Kiểm tra luồng Order/Payment hiện tại và đối chiếu tài liệu chính thức.
- [x] Lập kế hoạch, danh sách file, trạng thái và ma trận kiểm thử.
- [ ] Chuẩn bị tài khoản/khóa payOS.
- [ ] Chuẩn bị tài khoản/khóa VNPAY Sandbox.
- [ ] Chuẩn bị HTTPS callback.
- [x] TT1: nền tảng và kiểm thử dùng chung.
- [x] TT2: payOS code + mock test.
- [ ] TT2: giao dịch payOS thật nhỏ do chủ dự án thực hiện.
- [x] TT3: VNPAY code + mock test.
- [ ] TT3: kiểm thử với cổng VNPAY Sandbox.
- [ ] TT4: UI, scheduler, E2E, báo cáo và nghiệm thu.

Sau mỗi lượt, bổ sung nhật ký gồm: ngày, file đã đổi, migration/script đã chạy, test thực tế, giới hạn còn lại và bước tiếp theo. Chưa có mục triển khai nào được đánh dấu hoàn thành trong lần lập kế hoạch này.

## 10. Bổ sung sau rà soát ngày 09/09/2026

### 10.1. Các điểm cụ thể cần sửa từ mã hiện tại

| Phát hiện | Đầu việc và tiêu chí hoàn thành |
| --- | --- |
| `CheckoutForm.tsx` chỉ khóa nút bằng state; API chưa có idempotency | TT1: lưu checkout key phía client qua lỗi mạng; server tìm đơn theo user/key trước khi đọc giỏ đã bị xóa. Hai request đồng thời phải trả cùng orderId. |
| `proxy.ts` chỉ giữ pathname khi chuyển sang login | TT4: giữ đường dẫn và query nội bộ để không mất orderId của trang kết quả khi hết phiên. Kiểm tra redirect ở `LoginForm.tsx`, chỉ chấp nhận đường dẫn nội bộ hợp lệ. |
| `checkout/success/page.tsx` xác nhận đặt hàng, chưa hiển thị kết quả thu tiền | TT4: giữ ý nghĩa “đặt hàng thành công”; trang payment-result lấy trạng thái từ database và phân biệt “đang xác nhận” với “đã thanh toán”. |
| `markDemoPaymentAsPaid` đặt đơn thành CONFIRMED sau bước đọc ngoài transaction | TT1: kiểm tra trạng thái trong transaction; không xác nhận đơn CANCELLED hoặc kéo lùi tiến độ giao hàng. Áp dụng cờ DEMO cả API lẫn UI. |
| Lượt coupon chỉ tăng nếu `couponDiscountAmount > 0` | TT1: thêm `couponUsageReserved` boolean hoặc dấu mốc tương đương trên Order. Chỉ hoàn coupon nếu đơn thực sự đã tăng usedCount; có couponId không đủ làm bằng chứng. |
| Dashboard cộng tất cả đơn PAID | TT4: lọc môi trường và isTestOrder ở truy vấn database; hiển thị riêng khoản đã nhận cần đối soát, không coi đơn hủy có tiền đến muộn là doanh thu bán hàng bình thường. |

### 10.2. Chốt hợp đồng nội bộ trước khi viết adapter

Đây là thiết kế ứng dụng, không phải định dạng API của nhà cung cấp:

- `POST /api/orders`: header `Idempotency-Key`, body theo checkoutSchema mở rộng. Lần đầu trả 201; replay hợp lệ trả 200 cùng orderId; cùng key khác nội dung trả 409. Unique constraint dùng `(userId, checkoutKey)`; dữ liệu cũ để key null. Không tính lại payload hash từ giỏ hiện tại khi replay vì giỏ có thể đã xóa hoặc thay đổi.
- `POST /api/payment/requests`: nhận `{ orderId }` và request key, không nhận amount hoặc provider tùy ý. Server lấy phương thức và tổng tiền từ đơn; trả `{ orderId, attemptId, status, checkoutUrl, expiresAt }`. Nếu attempt đang CREATING/UNKNOWN thì trả trạng thái chờ, không tạo thêm attempt.
- `GET /api/payment/orders/[orderId]`: trả DTO giới hạn gồm trạng thái đơn/thanh toán, môi trường, hạn và các hành động được phép; dùng `Cache-Control: no-store`. Không trả thông tin tài khoản đối ứng hay payload webhook.
- Refresh và cancel có thể trả 202 khi đang đối soát; UI không diễn giải 202 thành thất bại hoặc đã hủy. Sai quyền sở hữu không tiết lộ dữ liệu đơn.
- Adapter có các thao tác create, query, verifyNotification và khả năng cancel tường minh. Không giả định mọi cổng đều hỗ trợ hủy đường dẫn thanh toán như payOS. Kết quả chuẩn hóa phải giữ phân biệt pending, thành công, kết thúc chưa trả tiền và chưa rõ kết quả.
- Polling UI đề xuất 3 giây/lần trong tối đa 60 giây, chỉ đọc DB; nút refresh gọi cổng có giới hạn riêng. Scheduler dùng retry/backoff, không truy vấn cổng mỗi lần render.

### 10.3. Hoàn thiện dữ liệu để xử lý sự cố

- Lưu `providerCreatedAt` (đúng chuỗi thời gian gửi VNPAY), `merchantAccountId` không bí mật và `lastReconciledAt` trên attempt. Không lưu HashSecret/API Key trong database giao dịch.
- Bổ sung chỉ mục `(status, expiresAt)` và `(paymentId, createdAt)`; unique tham chiếu theo provider/environment/merchant. `activePaymentId` chỉ được giải phóng khi attempt kết thúc đã kiểm chứng, trong cùng transaction cập nhật trạng thái.
- Event key phải dựa trên định danh giao dịch của cổng và ngữ nghĩa sự kiện; không dùng riêng orderId để dedupe. Hai khoản chuyển khác nhau cho cùng đơn là hai sự kiện cần đối soát.
- Lưu sự kiện tiền đến muộn ngay cả khi order đã CANCELLED: Payment phản ánh khoản tiền thực nhận, Order vẫn CANCELLED và needsReview=true. Tác vụ hoàn kho không được ghi UNPAID đè lên kết quả đã trả tiền.
- Job đối soát có lease trong DB hoặc cơ chế tương đương để hai tiến trình không xử lý cùng batch; cập nhật có điều kiện vẫn là lớp bảo đảm cuối cùng. Job chết giữa chừng phải tiếp tục được sau khi lease hết hạn.
- Với VNPAY, không tự xem query “không tìm thấy” hay hết hạn trên đồng hồ local là bằng chứng hủy ngay lập tức. Chờ hết thời hạn cổng, đối soát theo điều kiện merchant; nếu chưa xác định được thì chuyển cần kiểm tra. Không giữ hàng vô hạn mà thiếu cảnh báo admin và quy trình xử lý.

### 10.4. Ca kiểm thử bổ sung cho TT1–TT4

| Mã | Kịch bản | Kết quả yêu cầu |
| --- | --- | --- |
| P26 | API tạo đơn commit nhưng client mất response, giỏ đã rỗng | Retry cùng key trả đơn cũ, không báo giỏ trống |
| P27 | Hết phiên đăng nhập khi quay lại từ cổng | Đăng nhập xong về đúng đơn; redirect ngoài website bị từ chối |
| P28 | Coupon tồn tại nhưng giảm 0 đồng | Hủy đơn không giảm usedCount của người khác |
| P29 | Scheduler và callback cùng chạy | Chỉ một quyết định giữ/hoàn kho có hiệu lực; tiền đã nhận không bị mất trạng thái |
| P30 | Server chết sau khi cổng tạo link nhưng trước khi lưu response | Khôi phục qua mã tham chiếu đã lưu; không tạo link thu tiền thứ hai |
| P31 | Hai scheduler chạy và một tiến trình chết | Không nhân đôi tác động, lease hết hạn cho phép phục hồi |
| P32 | Callback hợp lệ có giao dịch mới trên đơn đã PAID | Lưu ngoại lệ trùng thanh toán, không bỏ qua như callback lặp |
| P33 | Đơn CANCELLED gọi endpoint demo | Từ chối xác nhận; không chuyển lại CONFIRMED |

### 10.5. Trình tự thực hiện ngay khi bắt đầu code

1. Đọc hướng dẫn Next.js cục bộ trong `node_modules/next/dist/docs/` theo `AGENTS.md`; kiểm tra Route Handler, request/cookie và runtime Node.js trước khi sửa API.
2. Hoàn thành TT1 cùng migration/test trước. Không cần thông tin ngân hàng để làm nền tảng này.
3. Nối adapter và UI tối thiểu cho từng cổng để kiểm thử xuyên suốt ngay trong TT2/TT3; TT4 hoàn thiện UX và vận hành, không để việc nối UI lần đầu tới cuối dự án.
4. Chuẩn bị merchant VNPAY Sandbox và kênh payOS trong thời gian triển khai. Khóa nhập trực tiếp vào môi trường local, không cần gửi trong hội thoại.
5. Nghiệm thu riêng ba mức: test nội bộ, kết nối VNPAY Sandbox, giao dịch payOS thực tế. Chỉ đánh dấu mức có bằng chứng đã chạy.

Lần rà soát này chỉ cập nhật kế hoạch. Chưa sửa mã chạy, cài SDK, chạy migration, chạy test thanh toán hoặc tạo giao dịch.

## 11. Nhật ký triển khai 09/09/2026

Phần này cập nhật sau lượt lập kế hoạch, thay thế mô tả “chưa triển khai” trong các phần thiết kế phía trên.

### Đã thực hiện

- Cài và cố định `@payos/node@2.0.5`; thêm provider payOS, provider VNPAY HMAC-SHA512/QueryDr và service điều phối thanh toán.
- Thêm PaymentAttempt/PaymentEvent, môi trường, snapshot giữ kho/coupon, checkout key và cancelRequestedAt. Giữ Payment một-một với Order.
- Hai migration mới đã kiểm trên bản sao và áp dụng local; backup trong `backups/`. Giữ dữ liệu cột cũ, phân loại DEMO cũ và LEGACY cho khoản khác.
- Checkout chống lặp, mở cổng online, trang kết quả và tiếp tục thanh toán. Callback kiểm chữ ký không phụ thuộc cookie; Return URL không xác nhận thu tiền.
- Xử lý timeout, callback lặp/đồng thời, tiền đến muộn, sai số tiền, hoàn kho/coupon một lần và giữ yêu cầu hủy qua restart/cooldown. Đơn tổng 0 không gọi cổng.
- Admin có lịch sử thanh toán/cảnh báo, dashboard tách nhóm doanh thu. DEMO kiểm cờ server và không xác nhận đơn đã hủy.
- Có script backup, đối soát theo batch và script đăng ký Windows Task Scheduler. `.env.example` và `.env` local được bổ sung cấu hình; hai cổng vẫn tắt do thiếu khóa.

### Bằng chứng kiểm thử

- `test:payment`: 16 nhóm service/provider đã qua, gồm callback/checkout đồng thời, chữ ký, amount, QueryDr, mock payOS create/query/cancel và phục hồi timeout.
- `test:payment:http`: Next.js server/DB riêng; xác minh callback payOS bằng SDK, IPN VNPAY, auth/ownership, CSRF, redirect hết phiên, query giả và trang kết quả.
- Kiểm tra cuối: `test:smoke`, TypeScript, ESLint, production build và `test:payment:http` đều thành công. `git diff --check` sạch. `payment:reconcile` chạy thành công với 0 đơn online trên database local.
- Fixture dùng khóa giả. Không tạo đơn thử trong database đang dùng, không chuyển tiền thật.

### Khác biệt đã chốt

- Điều phối online ở `src/services/online-payment.service.ts`; service demo giữ ở `payment.service.ts` để tương thích.
- URL payment/query VNPAY cố định Sandbox trong adapter thay vì env tùy ý.
- Query VNPAY cách nhau ít nhất 5 phút theo hạn chế QueryDr; payOS ít nhất 30 giây. Job dùng lease 60 giây.
- Yêu cầu hủy lưu trong Order. Với VNPAY, đợi trạng thái kết thúc được xác minh; không giả định có API hủy link như payOS.
- Trạng thái đảo giao dịch/hoàn tiền/nghi ngờ cần đối soát, không tự hoàn kho.
- Script HTTP yêu cầu build trước, không dùng cổng website đang chạy.

### Chưa hoàn thành và điều kiện tiếp tục

- Chưa có merchant credentials/HTTPS callback. Chủ dự án điền trực tiếp `.env` và đăng ký callback theo PAYMENT_SETUP.md.
- Chưa giao dịch payOS thực tế hoặc thanh toán qua VNPAY Sandbox; mock không được xem là nghiệm thu kết nối cổng.
- Chưa đăng ký scheduler vào Windows; đã chuẩn bị script cho lúc merchant/server sẵn sàng.
- Browser runtime trả danh sách rỗng; chưa kiểm tương tác/hình thức desktop/mobile hay chụp minh chứng.
- Chưa có UI xử lý dứt điểm ngoại lệ hoặc hoàn tiền tự động. Ngoại lệ giữ cảnh báo để admin kiểm tra merchant và xử lý nghiệp vụ.
