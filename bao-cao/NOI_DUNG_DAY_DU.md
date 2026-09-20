# TÓM TẮT CHI TIẾT DỰ ÁN FIGURE SHOP

Tài liệu nền cho báo cáo đồ án: yêu cầu, công nghệ, phân tích hệ thống và thiết kế cơ sở dữ liệu.

Đề tài gợi ý: Xây dựng website thương mại điện tử bán mô hình sưu tầm tích hợp trợ lý tư vấn AI.

Ngày đối chiếu: 20/09/2026. Mã nguồn tham chiếu: repository DATN_NGUYENDUYTHAI, bao gồm đổi loại hàng, wishlist theo tài khoản, lịch sử chat AI, đánh giá sản phẩm và cập nhật quản trị người dùng/báo cáo sau commit a310f0b. Đây là bản tổng hợp kỹ thuật theo mã nguồn; cần bổ sung tên trường, chuyên ngành, sinh viên và giảng viên theo mẫu báo cáo chính thức.

## 1. Tổng quan và phạm vi đề tài

### 1.1. Bài toán thực tế

Người sưu tầm mô hình cần tìm sản phẩm theo nhân vật, thương hiệu, dòng mô hình và ngân sách; phân biệt hàng có sẵn với hàng đặt trước; xem ảnh, giá và ưu đãi trước khi đặt hàng. Cửa hàng cần tập trung dữ liệu sản phẩm, tồn kho, đơn hàng và giao dịch, thay vì quản lý rời rạc bằng tin nhắn hoặc bảng tính.

Figure Shop giải quyết bài toán trên bằng website gồm giao diện khách hàng, khu vực quản trị và trợ lý AI. Hệ thống thống nhất việc hiển thị giá, tính khuyến mãi, tạo đơn và ghi nhận thanh toán trên nền tảng Next.js kết hợp Prisma và SQLite.

### 1.2. Mục tiêu

- Xây dựng quy trình xem sản phẩm, tìm kiếm, lưu yêu thích, thêm giỏ, đặt hàng và theo dõi đơn.
- Hỗ trợ sản phẩm có sẵn và pre-order với quy tắc tồn kho, giá và thông tin trạng thái rõ ràng.
- Hỗ trợ quản trị sản phẩm, danh mục, thương hiệu, khuyến mãi, coupon, tra cứu đơn hàng và doanh thu.
- Tích hợp AI tư vấn dựa trên danh mục thực tế, không cho AI tự sửa giỏ hoặc tạo giao dịch.
- Tổ chức dữ liệu có quan hệ, lưu lịch sử giá tại thời điểm mua và chuẩn bị cấu trúc cho tích hợp cổng thanh toán.

### 1.3. Phạm vi hiện tại và phần mở rộng

Phạm vi sử dụng đã thống nhất là demo nội bộ. Mã nguồn hỗ trợ COD, chuyển khoản thủ công, thanh toán DEMO và hai tích hợp payOS/VNPAY. Cấu hình được kiểm tra tại thời điểm lập tài liệu: PAYOS_ENABLED=false, VNPAY_ENABLED=false, DEMO_PAYMENT_ENABLED=true. Vì vậy không trình bày rằng website đang vận hành thanh toán trực tuyến thật. Việc có bảng và mã nguồn tích hợp không đồng nghĩa cổng đang được bật hoặc đã nghiệm thu toàn bộ.

Website hiện có trang sản phẩm, danh mục, thương hiệu, preorder, tài khoản, giỏ hàng, thanh toán, yêu thích và quản trị. Menu ngang đã bỏ Hướng dẫn và Liên hệ, nhưng các trang tương ứng vẫn tồn tại. Khối ưu đãi nằm ngay dưới banner, hiển thị tối đa 8 sản phẩm và loại trừ pre-order.

Danh sách yêu thích của tài khoản lưu trong WishlistItem; khách chưa đăng nhập vẫn dùng localStorage. Chat AI lưu nhiều cuộc trò chuyện theo tài khoản trong AiConversation/AiMessage. ProductReview lưu đánh giá của khách có đơn hàng đã hoàn thành. Trường chiều cao, chất liệu, phụ kiện, nhân vật, series và ngày dự kiến về hàng chưa được tách thành thuộc tính dữ liệu riêng. Giao diện ghi đang cập nhật khi chưa có thông tin; tỷ lệ chỉ được lấy từ tên sản phẩm nếu tên chứa dạng 1/n.

## 2. Yêu cầu của hệ thống

### 2.1. Các tác nhân

| Tác nhân | Vai trò và phạm vi |
|---|---|
| Khách chưa đăng nhập | Xem danh mục, tìm kiếm, nhận gợi ý, xem chi tiết, lưu yêu thích trên trình duyệt, trò chuyện với AI, đăng ký và đăng nhập. |
| CUSTOMER | Thực hiện các chức năng công khai; sử dụng giỏ, checkout, thông tin tài khoản và xem đơn hàng của mình. |
| STAFF | Được vào khu vực quản trị theo kiểm tra vai trò hiện hành; thao tác nghiệp vụ theo các chức năng đã triển khai. |
| ADMIN | Vai trò quản trị; hiện nhiều chức năng dùng chung cơ chế cho STAFF và ADMIN, chưa có ma trận quyền chi tiết cho từng thao tác. |
| Dịch vụ OpenAI | Nhận yêu cầu hội thoại từ server, có thể yêu cầu gọi công cụ đọc sản phẩm để tạo câu trả lời. |
| payOS/VNPAY | Tác nhân tích hợp mở rộng: tạo yêu cầu thanh toán, callback/IPN/webhook, truy vấn trạng thái khi được bật. |

### 2.2. Yêu cầu chức năng

| Mã | Nhóm chức năng | Yêu cầu và tình trạng |
|---|---|---|
| FR01 | Tài khoản | Đăng ký, đăng nhập, đăng xuất, đọc người dùng hiện tại và cập nhật hồ sơ; mật khẩu được băm. |
| FR02 | Danh mục sản phẩm | Liệt kê sản phẩm ACTIVE; xem ảnh, giá, thương hiệu, danh mục, tình trạng hàng và chi tiết sản phẩm. |
| FR03 | Tìm kiếm và lọc | Tìm theo tên, mô tả, thương hiệu, danh mục và slug; lọc giá, loại hàng, danh mục, thương hiệu; phân trang và sắp xếp. |
| FR04 | Gợi ý khi nhập | Chờ 250 ms sau lần nhập, trả tối đa 5 sản phẩm gồm tên, ảnh, giá; hỗ trợ chuột, phím mũi tên, Enter và Escape. |
| FR05 | Yêu thích | Bật/tắt trái tim, lưu database theo tài khoản; khôi phục khi đăng nhập lại hoặc đổi thiết bị. Khách dùng localStorage riêng. |
| FR06 | Giỏ hàng | Người đăng nhập thêm, sửa số lượng, xóa sản phẩm; hiển thị số lượng và thông báo thêm thành công. |
| FR07 | Khuyến mãi | Chọn ưu đãi sản phẩm hiệu quả nhất trong các nguồn sản phẩm/danh mục/thương hiệu; không áp dụng Promotion cho PREORDER. |
| FR08 | Coupon | Áp mã cho giỏ, kiểm tra thời hạn, trạng thái, mức đơn tối thiểu và giới hạn lượt; tính lại khi tạo đơn. |
| FR09 | Đặt hàng | Kiểm tra giỏ, giá và tồn kho; lưu người nhận, chi tiết hàng, tổng tiền và bản ghi thanh toán trong giao dịch database. |
| FR10 | Thanh toán demo | Chỉ chủ đơn DEMO hợp lệ được xác nhận giả lập thanh toán; không cho dùng luồng này để xác nhận đơn cổng thật. |
| FR11 | Đơn hàng | Khách xem đơn của mình; nhân viên/quản trị tra cứu danh sách, chi tiết và thông tin thanh toán. |
| FR12 | Quản trị danh mục | Tạo/sửa/lưu trữ sản phẩm; quản lý danh mục, thương hiệu, ảnh và điều kiện khuyến mãi/coupon. |
| FR13 | Doanh thu | Thống kê theo thời gian và phương thức, phân biệt tiền đã ghi nhận với tiền chờ; loại đơn hủy và giao dịch cần đối soát khỏi số đã thu. |
| FR14 | Trợ lý AI | Tư vấn, tìm mô hình theo nhu cầu, lấy chi tiết, so sánh và đọc tổng quan danh mục qua công cụ phía server. |
| FR15 | Thanh toán mở rộng | Có mã payOS/VNPAY và cấu trúc lần thử/sự kiện; hiện tắt trong cấu hình demo, cần kiểm thử tích hợp riêng trước khi bật. |
| FR16 | Đổi loại hàng | STAFF/ADMIN đổi IN_STOCK ↔ PREORDER ngay trong danh sách; nhập tồn khi chọn IN_STOCK; chuyển PREORDER tắt ưu đãi trực tiếp. |
| FR17 | Lịch sử AI | Lưu nhiều hội thoại theo tài khoản, mở lại hội thoại gần nhất, chọn hội thoại cũ hoặc tạo mới. |
| FR18 | Đánh giá | Chọn 1–5 sao và nhận xét 10–2.000 ký tự sau khi đơn hoàn thành; mỗi tài khoản/sản phẩm một đánh giá, được sửa/xóa của mình. Hiển thị trung bình, thống kê sao, phân trang 5 nhận xét/trang. |
| FR19 | Quản trị người dùng | Chỉ ADMIN: tìm kiếm, lọc vai trò/trạng thái, danh sách phân trang 20 tài khoản, xem chi tiết và 10 đơn gần nhất; khóa/mở và đổi CUSTOMER/STAFF/ADMIN. |
| FR20 | Trang báo cáo | /admin/reports dành cho STAFF/ADMIN, dùng cùng cách tính doanh thu với Dashboard; chọn 7/30/90 ngày, so sánh kỳ trước, biểu đồ và bảng theo ngày/phương thức. |

### 2.3. Quy tắc nghiệp vụ

Sản phẩm có ba trạng thái công bố: ACTIVE, DRAFT và ARCHIVED. Chỉ sản phẩm ACTIVE được đưa vào danh sách bán công khai. Loại sản phẩm gồm IN_STOCK và PREORDER; loại hàng không thay thế trạng thái công bố.

Với hàng IN_STOCK, hệ thống kiểm tra tồn kho và giảm tồn bằng cập nhật có điều kiện stock ≥ quantity khi tạo đơn. Hàng PREORDER không giữ tồn theo cơ chế này và reservedQuantity của dòng đơn bằng 0. Việc thêm giỏ không đồng nghĩa đã giữ hàng; dữ liệu phải được kiểm tra lại ở checkout.

Không cộng dồn nhiều Promotion trên cùng một sản phẩm. Hệ thống thu thập các ưu đãi đang hoạt động, loại bản ghi trùng và chọn mức giảm tiền tốt nhất. PREORDER luôn trả về Promotion hiệu lực bằng null, kể cả khi ưu đãi gắn ở danh mục hoặc thương hiệu. Biểu mẫu khuyến mãi chỉ cho chọn hàng có sẵn và service từ chối tạo/cập nhật ưu đãi trực tiếp cho pre-order.

Coupon là giảm giá cấp đơn, được tính sau giảm giá sản phẩm. Mã hiện tại không loại riêng giá trị pre-order khỏi cơ sở tính Coupon. Khi báo cáo yêu cầu “không giảm giá pre-order”, cần nói rõ quy tắc đã triển khai áp dụng cho Promotion; nếu muốn cấm cả coupon thì phải bổ sung nghiệp vụ và kiểm thử đơn hỗn hợp.

Mỗi người dùng có tối đa một giỏ hàng. Một cặp giỏ–sản phẩm chỉ có một dòng. Mỗi đơn có tối đa một Payment; Payment có thể có nhiều PaymentAttempt khi tích hợp cổng thanh toán. Tên, đơn giá và địa chỉ giao hàng được lưu tại thời điểm đặt để lịch sử không thay đổi theo dữ liệu hiện tại.

Nút Mua ngay hiện thêm sản phẩm rồi chuyển sang giỏ hàng. Nó không chuyển thẳng checkout và không tạo đơn riêng chỉ chứa sản phẩm đang xem. Giỏ hiện tại được dùng cho quá trình đặt hàng tiếp theo.

### 2.4. Yêu cầu phi chức năng

| Mã | Tiêu chí | Hiện trạng và cách đánh giá |
|---|---|---|
| NFR01 | An toàn dữ liệu | JWT trong cookie httpOnly; bcrypt; đối chiếu phiên với database; kiểm tra quyền tại API, trang quản trị người dùng và các Server Action quản trị hiện có. |
| NFR02 | Toàn vẹn | Khóa ngoại, unique, transaction và cập nhật có điều kiện bảo vệ quan hệ, tồn kho, lượt coupon. |
| NFR03 | Hiệu năng | Phân trang, gợi ý tối đa 5 kết quả, debounce, hủy request cũ, Next Image và WebP. Chưa có số đo tải lớn để cam kết SLA. |
| NFR04 | Khả dụng | Trạng thái loading, báo lỗi, retry thủ công, trang không tìm thấy và xử lý giỏ rỗng. |
| NFR05 | Responsive | Lưới sản phẩm theo kích thước màn hình, bộ lọc dạng dialog, menu mobile, một nút hỗ trợ tổng hợp. |
| NFR06 | Tiếp cận | Nhãn aria, điều hướng bàn phím cho tìm kiếm, trạng thái thông báo và prefers-reduced-motion. Chưa nghiệm thu WCAG toàn diện. |
| NFR07 | Bảo trì | Tách components/services/validations/lib; Prisma migration, ESLint, TypeScript và script kiểm thử. |
| NFR08 | Vận hành | Cấu hình qua biến môi trường, không commit secret/database, lưu backup và có công cụ đối soát thanh toán. |

## 3. Công nghệ sử dụng

### 3.1. Ngăn xếp công nghệ

Các phiên bản dưới đây lấy từ khai báo package.json của dự án, không phải khẳng định phiên bản mới nhất trên thị trường. Dấu ^ biểu thị khoảng phiên bản cho phép; package-lock.json khóa phiên bản cài đặt cụ thể.

| Công nghệ | Phiên bản khai báo | Vai trò |
|---|---|---|
| Next.js | 16.2.9 | App Router, Server/Client Components, Route Handlers, Server Actions, tối ưu ảnh và điều hướng. |
| React / React DOM | 19.2.4 | Xây dựng giao diện thành phần, quản lý trạng thái tương tác. |
| TypeScript | ^5 | Kiểu dữ liệu cho component, request, service và client database. |
| Tailwind CSS | ^4 | Định dạng giao diện responsive kết hợp CSS tùy chỉnh. |
| Node.js / npm | Runtime theo môi trường cài đặt | Chạy Next server, quản lý gói và các lệnh kiểm tra/build. |
| Prisma / Prisma Client | ^7.8.0 | Schema, migration, truy vấn và transaction có kiểu. |
| SQLite / better-sqlite3 | driver ^12.10.0 | Database cục bộ dạng file; truy cập qua Prisma adapter. |
| Prisma SQLite adapter | ^7.8.0 | Kết nối Prisma với better-sqlite3. |
| Zod | ^4.4.3 | Kiểm tra đầu vào tài khoản, giỏ, sản phẩm, đơn, khuyến mãi và AI. |
| jose | ^6.2.3 | Ký/xác minh JWT bằng HS256. |
| bcryptjs | ^3.0.3 | Băm mật khẩu với cost 12 và kiểm tra khi đăng nhập. |
| OpenAI SDK | ^7.15.0 | Gọi Chat Completions và function calling từ server. |
| payOS Node SDK | 2.0.5 | Mã tích hợp payOS, hiện được khóa bằng cấu hình. |
| Lucide React | ^1.18.0 | Biểu tượng giao diện. |
| ESLint / eslint-config-next | ^9 / 16.2.9 | Kiểm tra quy tắc chất lượng mã nguồn. |
| tsx | ^4.22.4 | Chạy seed và các script TypeScript. |
| Git / GitHub | Không ràng buộc trong package.json | Quản lý phiên bản và lưu repository. |

### 3.2. Vai trò của các công nghệ

Next.js đảm nhiệm cả giao diện và backend trong cùng một ứng dụng. Các trang có thể đọc dữ liệu trên server; phần cần state, localStorage, dialog, gợi ý tìm kiếm hoặc sự kiện dùng Client Component. Route Handlers cung cấp API HTTP. Một số biểu mẫu quản trị dùng Server Actions. Đây là kiến trúc ứng dụng nguyên khối theo mô-đun, không phải hệ thống microservices hoặc backend Express tách riêng.

Prisma mô tả cấu trúc dữ liệu và tạo client truy vấn. SQLite phù hợp demo, triển khai cục bộ và dữ liệu quy mô nhỏ. Khi nhiều tiến trình ghi hoặc có nhiều máy chủ, cần đánh giá chuyển PostgreSQL/MySQL, cơ chế backup và hạ tầng lưu file dùng chung; chưa nên suy ra năng lực production từ môi trường localhost.

OpenAI được cấu hình qua OPENAI_API_KEY và AI_MODEL. Mã nguồn đặt giá trị mặc định AI_MODEL là gpt-5.6-sol; đây là tên cấu hình của dự án, không phải cam kết mọi tài khoản API đều có quyền dùng model đó. Việc vận hành phải xác nhận khả năng truy cập model của tài khoản thực tế. Request sử dụng store=false; không thể suy ra từ tham số này rằng mọi cơ chế log/lưu giữ ở nhà cung cấp đều bị tắt.

VNPAY được tích hợp bằng mã provider và các hàm ký/xác minh; không có gói vnpay độc lập trong package.json. CSS animation, IntersectionObserver và API trình duyệt đảm nhiệm hiệu ứng; dự án không dùng Framer Motion. Ảnh được lưu trong public/images, ảnh đã bổ sung dùng WebP; dữ liệu hình ảnh là URL chứ không nhúng nhị phân vào SQLite.

## 4. Phân tích hệ thống chi tiết

### 4.1. Kiến trúc và phân lớp

Luồng chính: Trình duyệt → Next.js page/Route Handler/Server Action → service nghiệp vụ → Prisma → SQLite. Với AI và thanh toán mở rộng, service gọi nhà cung cấp bên ngoài bằng thông tin cấu hình ở server. Với ảnh, trình duyệt nhận tài nguyên từ public hoặc qua bộ tối ưu Next Image.

| Thư mục | Trách nhiệm |
|---|---|
| src/app | Trang theo App Router, layout, loading/error, API và khu vực admin/account/checkout. |
| src/components | Thành phần giao diện sản phẩm, giỏ, AI, biểu mẫu, menu, dashboard và hiệu ứng. |
| src/services | Nghiệp vụ danh mục, tính giá, giỏ, đơn, thanh toán, AI và quản trị. |
| src/validations | Schema Zod xác thực dữ liệu đầu vào. |
| src/lib | Kết nối Prisma, JWT, quyền, cấu hình thanh toán, tiện ích và tổng hợp doanh thu. |
| prisma | Schema, migration, dữ liệu seed và ánh xạ ảnh sản phẩm. |
| public | Ảnh banner và ảnh sản phẩm phục vụ giao diện. |
| scripts / docs | Công cụ kiểm thử, sao lưu, đối soát, kiểm tra ảnh và tài liệu kỹ thuật. |

### 4.2. Use case UC01 — Đăng ký và đăng nhập

Tác nhân: khách. Tiền điều kiện: chưa có phiên hoặc phiên hết hạn. Luồng đăng nhập: nhập email/mật khẩu → API xác thực bằng Zod → tìm User theo email → bcrypt.compare → kiểm tra isActive → ký JWT → đặt cookie → điều hướng về trang phù hợp. JWT chứa userId, email, role và phiên bản sessionVersion khi đăng nhập, có hạn 7 ngày. Token không có phiên bản được hiểu là 0 để tương thích tài khoản chưa thu hồi phiên. Cookie dùng httpOnly, SameSite=Lax, path=/ và secure khi NODE_ENV=production.

Ngoại lệ gồm dữ liệu không hợp lệ, tài khoản không tồn tại, sai mật khẩu, bị khóa, token hết hạn hoặc sessionVersion không còn khớp. API không trả passwordHash. Proxy và getCurrentUser dùng chung getSessionUser, lấy trạng thái và vai trò hiện tại từ database. Trang quản lý người dùng gọi requireAdmin; API người dùng chỉ chấp nhận ADMIN; các Server Action quản trị hiện có gọi requireStaff ngay tại điểm xử lý. STAFF không thấy menu Người dùng và không được truy cập trực tiếp trang/API này.

### 4.3. Use case UC02 — Tìm và xem sản phẩm

Tác nhân: khách hoặc người dùng đã đăng nhập. Luồng chính: mở danh sách → nhập từ khóa/chọn điều kiện → truy vấn sản phẩm ACTIVE → hiển thị số lượng kết quả và lưới phân trang → mở chi tiết. Tìm kiếm hiện dùng contains trong các trường tên, mô tả, thương hiệu, danh mục và slug; chưa có search engine, full-text chuyên dụng, tìm gần đúng hoặc chuẩn hóa tiếng Việt không dấu toàn diện.

Endpoint gợi ý /api/products/suggestions nhận q; từ khóa rỗng hoặc dài quá 100 ký tự trả danh sách rỗng. Kết quả giới hạn 5 sản phẩm, trả id, name, slug, image, type và giá sau Promotion. Client trì hoãn 250 ms, hủy request cũ khi đổi từ khóa và không hiển thị kết quả của từ khóa trước. Khi không có kết quả hoặc lỗi mạng, người dùng vẫn có thể mở trang tìm kiếm đầy đủ.

Chi tiết sản phẩm hiển thị ảnh lớn có phóng to, các ảnh nhỏ nếu tồn tại, thương hiệu, danh mục, giá, tồn kho, số lượng mua, mô tả và thông tin pre-order. Danh sách liên quan được lấy theo cùng danh mục chính hoặc thương hiệu, không phải mô hình gợi ý học máy.

### 4.4. Use case UC03 — Quản lý giỏ hàng và yêu thích

Giỏ hàng yêu cầu đăng nhập. Khi thêm sản phẩm, server kiểm tra dữ liệu và sản phẩm; nếu cặp cartId/productId đã tồn tại thì điều chỉnh số lượng theo nghiệp vụ giỏ, tránh tạo hai dòng giống nhau. Giao diện gửi request và chỉ thông báo thành công sau khi server phản hồi thành công. router.refresh cập nhật dữ liệu server, trong đó có số lượng trên biểu tượng giỏ.

Với tài khoản đăng nhập, AccountDataProvider đọc danh sách yêu thích từ database; thao tác trái tim gọi PUT /api/wishlist và upsert/xóa WishlistItem theo userId lấy từ phiên xác thực. Khóa chính kép userId/productId ngăn lưu trùng. Trang /wishlist chỉ hiển thị sản phẩm ACTIVE. Khách chưa đăng nhập tiếp tục lưu tối đa 500 id trong localStorage. Danh sách khách không tự nhập vào tài khoản, tránh lẫn dữ liệu trên máy dùng chung; xóa dữ liệu trình duyệt chỉ làm mất danh sách khách, không xóa wishlist trong database.

### 4.5. Use case UC04 — Checkout và tạo đơn

Tiền điều kiện: người dùng đã đăng nhập, giỏ có sản phẩm và có thông tin người nhận hợp lệ. Nếu giỏ rỗng, trang checkout chuyển về giỏ. Giá và tổng tiền do server tính, không tin tổng tiền gửi từ client.

Luồng chính gồm: đọc giỏ trong transaction; kiểm tra trạng thái sản phẩm và lượng tồn; xác định Promotion hiệu lực; kiểm tra Coupon mới nhất; tính lại các khoản tiền; tạo Order cùng OrderItem và Payment; tăng lượt Coupon có điều kiện; giảm tồn hàng IN_STOCK có điều kiện; xóa CartItem và bỏ coupon trên giỏ. Nếu một bước thất bại, transaction rollback.

Khi có checkoutKey, hệ thống tra cặp userId/checkoutKey trước. Nếu đã tồn tại và hash dữ liệu giống nhau thì trả lại đơn cũ; nếu nội dung khác thì báo xung đột. Cơ chế này giúp tránh lặp đơn do gửi lại cùng yêu cầu; không nên mô tả là mọi luồng đều chống trùng tuyệt đối khi không cung cấp khóa.

Đơn thông thường khởi tạo PENDING/UNPAID. Trường hợp tổng thanh toán bằng 0 được đánh CONFIRMED/PAID. Chi phí vận chuyển trong createOrderFromCart hiện cố định bằng 0; chưa có dịch vụ tính phí giao hàng theo địa chỉ.

### 4.6. Công thức tính giá

Gọi P là đơn giá gốc, Q là số lượng và d là giảm giá mỗi đơn vị. Nếu giảm phần trăm r: d = floor(P × r / 100). Nếu giảm số tiền cố định F: d = F. Hệ thống giới hạn d trong [0, P]. Đơn giá sau giảm = P − d; tổng dòng = Q × (P − d); giảm dòng = Q × d.

Tạm tính = tổng P × Q của các dòng. Tổng giảm sản phẩm = tổng giảm dòng. Cơ sở tính coupon = tạm tính − giảm sản phẩm. Coupon chỉ có hiệu lực khi thỏa điều kiện ngày, trạng thái, ngưỡng đơn và lượt sử dụng; mức giảm được giới hạn bởi maxDiscountAmount nếu có và không vượt cơ sở tính coupon. Tổng đơn = tạm tính − giảm sản phẩm − giảm coupon + phí vận chuyển.

Ví dụ minh họa, không phải dữ liệu giao dịch thực: sản phẩm 1.000.000 đ giảm 20%, mua 2 sản phẩm tạo tổng dòng 1.600.000 đ; coupon 10% không có trần giảm thêm 160.000 đ; phí vận chuyển 0 thì tổng là 1.440.000 đ. Với pre-order, bỏ bước giảm Promotion nhưng Coupon cấp đơn vẫn theo quy tắc hiện hành.

### 4.7. Use case UC05 — Thanh toán và theo dõi đơn

Đối với DEMO, API kiểm tra phiên, cùng nguồn yêu cầu và chủ sở hữu đơn; service chỉ nhận đơn có paymentMethod=DEMO, không bị hủy/hoàn tiền. Nếu đã PAID thì trả lại kết quả cũ. Nếu hợp lệ, cập nhật Payment thành PAID, paidAt và transactionCode dạng DEMO; cập nhật Order.paymentStatus và chuyển PENDING sang CONFIRMED. Toàn bộ thực hiện trong transaction.

COD và BANK_TRANSFER là các lựa chọn riêng, không được tự động xác nhận bằng endpoint DEMO. Ghi nhận chuyển khoản thủ công không đồng nghĩa truy vấn hoặc xác minh ngân hàng tự động. Khu vực tài khoản kiểm tra chủ sở hữu khi đọc đơn; khu vực quản trị tra cứu toàn bộ đơn trong phạm vi quyền.

Luồng mở rộng payOS/VNPAY gồm tạo PaymentAttempt, lấy URL thanh toán, nhận thông báo server, xác minh chữ ký/tham chiếu/số tiền, cập nhật trạng thái và ghi PaymentEvent. Hệ thống có trạng thái UNKNOWN, cờ needsReview, cơ chế đối soát, thời hạn giữ hàng và yêu cầu hủy. Trang return chỉ là một bước trong luồng; không dùng thông báo trên trình duyệt làm bằng chứng duy nhất đã thanh toán.

OrderStatus được thiết kế: PENDING → CONFIRMED → PROCESSING → SHIPPED → COMPLETED, với CANCELLED là nhánh hủy. Đây là chu trình nghiệp vụ đề xuất tương ứng enum. Các trang quản trị hiện đã có danh sách, chi tiết và hiển thị tiến trình; chưa xác nhận có đầy đủ giao diện/API chuyển thủ công qua tất cả trạng thái, vì vậy không ghi là đã hoàn thiện quản lý giao vận.

### 4.8. Use case UC06 — Quản trị và báo cáo

Nhân viên/quản trị mở /admin để xem tổng quan, sản phẩm, đơn, preorder, danh mục, thương hiệu, Promotion và Coupon. Sản phẩm có thể được lưu trữ bằng ARCHIVED để ngừng bán mà vẫn giữ bản ghi; xóa sản phẩm chưa có ảnh trong đợt dọn dữ liệu là tác vụ bảo trì riêng, không phải lý do để mọi chức năng admin xóa cứng lịch sử.

Biểu đồ doanh thu hiện lấy các phương thức COD, BANK_TRANSFER và DEMO. Khoản đã thu yêu cầu Order.paymentStatus=PAID, Payment.status=PAID, không cần đối soát và đơn không CANCELLED. Ngày ghi nhận dùng paidAt; nếu thiếu thì dùng createdAt và đánh dấu số liệu ngày ước tính. Múi giờ phân ngày là UTC+7. BANK_TRANSFER và DEMO cùng được gộp vào nhóm transfer trong phần báo cáo này. Do đó đây là thống kê phục vụ demo, không phải báo cáo kế toán doanh thu thực đã loại toàn bộ đơn thử nghiệm.

### 4.9. Use case UC07 — Tư vấn AI

Client gửi message và conversationId đến /api/ai/chat khi đăng nhập. Server kiểm tra chủ hội thoại và lấy tối đa 10 tin gần nhất từ database, không dùng lịch sử do client cung cấp cho tài khoản. Khách chưa đăng nhập gửi lịch sử tạm thời; Zod giới hạn tin mới 800 ký tự, lịch sử khách tối đa 10 tin và mỗi tin tối đa 1.500 ký tự. API có rate limit theo định danh client, lưu bằng Map trong bộ nhớ; mặc định 10 request/phút và có cấu hình. Giới hạn này chưa phải rate limit phân tán và còn phụ thuộc độ tin cậy của header IP từ reverse proxy.

Sau khi AI trả lời thành công, transaction lưu cặp tin user/assistant cùng thẻ sản phẩm tham chiếu trong AiMessage và cập nhật AiConversation. Lần mở lại khôi phục hội thoại gần nhất; tạo hội thoại mới không xóa hội thoại cũ. Tin gửi thất bại chưa được lưu. Không tự nhập hội thoại khách vào tài khoản. API lịch sử lọc bằng userId từ cookie và trả Cache-Control private, no-store; tài khoản khác không được đọc hay nối tiếp hội thoại không thuộc mình.

Server tạo yêu cầu Chat Completions, cấp công cụ search_products, get_product_details, compare_products và get_catalog_overview. Kết quả công cụ đến từ service sản phẩm; vòng lặp công cụ được giới hạn. Các thẻ tham chiếu sản phẩm giúp khách mở đúng sản phẩm. AI chỉ tư vấn và đọc dữ liệu; không có công cụ sửa sản phẩm, tạo đơn hoặc thu tiền. Khi thiếu khóa hoặc gặp lỗi nhà cung cấp, API trả lỗi phù hợp thay vì giả lập câu trả lời thành công.

### 4.10. Các giao diện và API tiêu biểu

| Điểm vào | Trách nhiệm |
|---|---|
| GET /api/products/suggestions | Gợi ý sản phẩm khi gõ tìm kiếm, dữ liệu công khai. |
| POST /api/auth/register, /login, /logout | Quản lý đăng ký và phiên đăng nhập. |
| GET /api/auth/me | Đọc người dùng hiện tại. |
| GET /api/admin/users | Danh sách có q, role, status, page; chỉ ADMIN. |
| GET/PATCH /api/admin/users/[id] | Chi tiết hoặc đổi quyền/trạng thái; chỉ ADMIN, kiểm tra nguồn yêu cầu và phiên bản dữ liệu. |
| GET /api/cart | Đọc giỏ theo người dùng đăng nhập. |
| POST /api/cart/items | Thêm sản phẩm vào giỏ. |
| /api/cart/items/[id], /api/cart/coupon | Điều chỉnh dòng giỏ và coupon theo method của route. |
| POST /api/orders | Tạo đơn từ giỏ sau xác thực và kiểm tra dữ liệu. |
| /api/orders/[id] | Đọc thông tin đơn theo quyền sở hữu. |
| POST /api/payment/demo | Xác nhận giả lập cho đơn DEMO hợp lệ. |
| /api/payment/requests, /orders/[orderId] | Tạo/đọc yêu cầu và trạng thái thanh toán mở rộng. |
| /api/payment/payos/webhook, /vnpay/ipn, /vnpay/return | Điểm nhận thông báo/điều hướng cổng; cần cấu hình và xác minh theo provider. |
| POST /api/ai/chat | Tư vấn AI có kiểm tra đầu vào và rate limit. |
| GET/PUT /api/wishlist | Đọc và lưu/bỏ yêu thích của tài khoản đang đăng nhập. |
| GET /api/ai/conversations | Danh sách hội thoại; tham số id để đọc tin nhắn của hội thoại thuộc tài khoản. |
| PATCH /api/admin/products/[id] | Đổi loại hàng và tồn kho; chỉ STAFF/ADMIN. |
| GET/PUT/DELETE /api/products/[id]/reviews | Đọc đánh giá, lưu/sửa đánh giá đủ điều kiện và xóa đánh giá của chính mình. |
| /api/admin/products/[id], /promotions/[id], /coupons/[id] | Các thao tác quản trị theo Route Handler; biểu mẫu tạo còn sử dụng Server Action. |

## 5. Thiết kế cơ sở dữ liệu

### 5.1. Mô hình dữ liệu tổng thể

Schema hiện có 20 model nghiệp vụ, không tính bảng nội bộ _prisma_migrations: User, Address, Category, Brand, Product, ProductCategory, Promotion, Coupon, ProductImage, Cart, CartItem, Order, OrderItem, Payment, PaymentAttempt, PaymentEvent, WishlistItem, AiConversation, AiMessage và ProductReview.

Nhóm tài khoản gồm User/Address. Nhóm danh mục gồm Product/Brand/Category/ProductCategory/ProductImage. Nhóm giá gồm Promotion/Coupon. Nhóm giao dịch gồm Cart/CartItem/Order/OrderItem/Payment. Nhóm thanh toán mở rộng gồm PaymentAttempt/PaymentEvent. Tách các nhóm giúp giảm trùng dữ liệu danh mục nhưng vẫn giữ bản chụp nghiệp vụ trong đơn.

### 5.2. Quan hệ giữa các thực thể

| Quan hệ | Bội số | Khóa và ý nghĩa |
|---|---|---|
| User – Address | 1 : N | Address.userId; một người dùng có nhiều địa chỉ. |
| User – Cart | 1 : 0..1 | Cart.userId unique; mỗi người dùng tối đa một giỏ. |
| User – Order | 1 : N | Order.userId; lịch sử mua hàng. |
| User – Product qua WishlistItem | N : N | Khóa chính kép userId/productId; cả hai FK xóa Cascade. |
| User – AiConversation | 1 : N | userId; xóa tài khoản kéo theo hội thoại. |
| AiConversation – AiMessage | 1 : N | conversationId; xóa hội thoại kéo theo các tin nhắn. |
| User/Product – ProductReview | Mỗi phía 1 : N | Unique userId/productId; xóa tài khoản hoặc sản phẩm kéo theo đánh giá. |
| Brand – Product | 1 : N | Product.brandId nullable; một thương hiệu có nhiều sản phẩm. |
| Category – Product | 1 : N | Product.categoryId là danh mục chính, nullable. |
| Product – Category | N : N | ProductCategory; khóa chính kép productId/categoryId. |
| Product – ProductImage | 1 : N | ProductImage.productId; nhiều ảnh được sắp xếp. |
| Product – Promotion | 1 : 0..1 | Promotion.productId unique; ưu đãi trực tiếp. |
| Category/Brand – Promotion | 1 : N | Promotion.categoryId hoặc brandId theo scope. |
| Coupon – Cart/Order | 1 : N | Giỏ và đơn có tối đa một coupon; FK nullable. |
| Cart – CartItem – Product | 1 : N và N : 1 | Một dòng thuộc một giỏ, tham chiếu một sản phẩm. |
| Order – OrderItem | 1 : N | Dòng hàng giữ dữ liệu tại thời điểm đặt. |
| Product – OrderItem | 1 : N, FK nullable | Xóa sản phẩm có thể đặt productId=null, giữ snapshot dòng đơn. |
| Order – Payment | 1 : 0..1 | Payment.orderId unique; service tạo Payment cùng đơn. |
| Payment – PaymentAttempt | 1 : N | Lưu nhiều lần thử của một khoản thanh toán. |
| PaymentAttempt – PaymentEvent | 1 : N | Lưu các sự kiện xử lý có eventKey duy nhất. |

Hai liên kết Category–Product cùng tồn tại: danh mục chính để hiển thị và bảng nối để phân loại nhiều nhóm. Service quản trị đưa categoryId vào tập categoryIds và loại trùng, nhưng quy tắc “danh mục chính cũng có trong bảng nối” không tự được bảo đảm chỉ bằng khóa ngoại.

### 5.3. Kiểu dữ liệu và quy ước

String dùng cho mã định danh, tên, slug và chuỗi tham chiếu. Phần lớn id có @default(cuid()); id của PaymentAttempt và PaymentEvent là String do ứng dụng cung cấp. ProductCategory dùng khóa chính kép. Int dùng cho giá tiền VND và số lượng; việc dùng số nguyên tránh sai số nhị phân khi cộng tiền. DateTime dùng cho thời điểm; Boolean mô tả cờ nghiệp vụ; enum giới hạn giá trị ở tầng Prisma.

Ký hiệu ? trong schema cho phép null, [] là quan hệ nhiều bản ghi. @unique tạo tính duy nhất, @@unique là duy nhất nhiều trường, @@index là chỉ mục. Quan hệ khai báo trong Prisma không phải một cột vật lý bổ sung; cột FK tương ứng mới được lưu. Kiểu SQLite vật lý cần đối chiếu migration/PRAGMA khi triển khai, không coi Int của Prisma mặc nhiên là một miền INTEGER có mọi CHECK nghiệp vụ.

### 5.4. Các ràng buộc quan trọng

Email của User, slug của Category/Brand/Product, code của Coupon và orderNumber của Order là duy nhất. Cart.userId, Payment.orderId và Promotion.productId là duy nhất. CartItem có unique(cartId, productId). Order có unique(userId, checkoutKey); các dòng có checkoutKey=null không được coi là cùng một khóa đặt hàng.

PaymentAttempt dùng providerReference và requestKey duy nhất; activePaymentId là String nullable có unique để điều phối lần thử đang hoạt động, không được khai báo là quan hệ khóa ngoại trong Prisma. PaymentEvent.eventKey duy nhất để hạn chế xử lý lại cùng sự kiện.

Các điều kiện giá dương, tồn không âm, ngày bắt đầu trước ngày kết thúc, mục tiêu Promotion phù hợp scope, một địa chỉ mặc định và đồng bộ hai trạng thái thanh toán là các quy tắc cần xác thực ở ứng dụng. Không nên khẳng định toàn bộ đã là CHECK/constraint trong SQLite chỉ vì biểu mẫu hoặc service có kiểm tra.

### 5.5. Xóa dữ liệu và bảo toàn lịch sử

Các quan hệ có onDelete: Cascade rõ ràng gồm User→Address, User→Cart, User→Order; Product→ProductImage/ProductCategory/CartItem/Promotion; Category→ProductCategory/Promotion; Brand→Promotion; Cart→CartItem; Order→OrderItem/Payment. Vì xóa User có thể kéo theo đơn, cần hạn chế xóa cứng tài khoản nếu chuyển sang kinh doanh thật.

Coupon bị xóa sẽ đặt couponId của Cart/Order thành null; Order vẫn có couponCode và couponDiscountAmount. Product bị xóa sẽ đặt productId của OrderItem thành null; productName và các trường giá giữ thông tin giao dịch. PaymentAttempt→Payment và PaymentEvent→PaymentAttempt không khai báo Cascade; không được giả định xóa Payment sẽ tự xóa sạch lịch sử attempt/event.

### 5.6. Chuẩn hóa và dữ liệu snapshot

Brand/Category/Image được tách khỏi Product, giúp cập nhật dữ liệu danh mục tập trung và tránh một cột chứa nhiều ảnh. OrderItem giải quyết quan hệ nhiều sản phẩm trong một đơn. ProductCategory giải quyết quan hệ nhiều–nhiều theo dạng bảng nối. CartItem tránh lưu các dòng giỏ trong một chuỗi JSON khó ràng buộc.

Một số dữ liệu được lặp có chủ đích: Order lưu địa chỉ và người nhận độc lập Address; OrderItem lưu tên và giá độc lập Product; Order lưu couponCode độc lập Coupon. Đây là phi chuẩn hóa có kiểm soát để bảo toàn lịch sử. Order.paymentStatus và Payment.status cũng trùng ý nghĩa nên phải được cập nhật đồng bộ trong transaction và kiểm tra khi đối soát.

### 5.7. Chỉ mục và khả năng mở rộng

Các chỉ mục hỗ trợ lọc Promotion theo hoạt động/thời gian/phạm vi, Coupon theo thời gian, tra ProductCategory theo categoryId, tìm đơn chờ hết hạn, tìm PaymentAttempt theo status/expiresAt và theo paymentId/createdAt. Unique trên mã tham chiếu giúp callback truy ra đúng lần thử.

Tìm kiếm contains và báo cáo tổng hợp chưa được chứng minh hiệu năng ở dữ liệu lớn. Các cải tiến có thể bổ sung sau: index dựa trên truy vấn thực tế, FTS cho tìm kiếm, cache danh mục công khai, rate limit dùng Redis, lưu ảnh ở object storage và chuyển database khi cần mở rộng nhiều server. Đây là phương án, chưa phải công nghệ đang dùng.

## 6. Kiểm thử, giới hạn và hướng phát triển

### 6.1. Kiểm thử phù hợp với đồ án

Nhóm công cụ có sẵn gồm kiểm tra TypeScript, ESLint, smoke test, kiểm thử AI tools, payment service/HTTP, doanh thu, khám phá sản phẩm và quy tắc pre-order. Các script báo cáo ảnh đối chiếu manifest, URL và giải mã ảnh local. Khi đưa số lượng test pass, thời gian phản hồi hoặc tỷ lệ bao phủ vào báo cáo chính thức, phải đính kèm log của lần chạy cụ thể; tài liệu này không suy diễn độ bao phủ từ tên script.

Các ca kiểm thử cần trình bày: đăng nhập sai; truy cập admin bằng CUSTOMER; giỏ rỗng; tăng lượng vượt tồn; sản phẩm bị ARCHIVED sau khi thêm giỏ; coupon hết hạn/hết lượt; hai yêu cầu cạnh tranh tồn; gửi lại checkoutKey; pre-order bị gắn ưu đãi danh mục; DEMO xác nhận lặp; người dùng đọc đơn người khác; tìm kiếm rỗng/không có kết quả; lỗi API gợi ý; yêu thích khi localStorage bị chặn.

### 6.2. Giới hạn cần công bố

- Chưa có trường riêng cho nhiều thông số mô hình và ngày về hàng; nội dung hiện tại không được xem là dữ liệu kỹ thuật đã xác minh đầy đủ.
- Đã có wishlist, lịch sử chat và đánh giá trong database. Chưa có quản trị kiểm duyệt/phản hồi đánh giá, ảnh đính kèm nhận xét, tìm kiếm/phân trang lịch sử chat hoặc bảng thông báo.
- Address có trong schema nhưng cần kiểm tra giao diện quản lý sổ địa chỉ riêng trước khi ghi là đã hoàn thành CRUD địa chỉ.
- Luồng quản trị chưa được xác nhận có đầy đủ thao tác chuyển trạng thái đơn, xác nhận thủ công COD/chuyển khoản và hoàn tiền.
- Chưa có phí vận chuyển thực, tích hợp vận đơn, kế toán, kiểm thử tải hoặc SLA production.
- Một số ảnh và hãng trong danh mục demo còn cần đối chiếu; không coi nội dung ảnh demo là bằng chứng xác thực hàng hóa.
- Cần tăng kiểm tra quyền tại từng Server Action, chống lạm dụng, CSRF ở các điểm ghi và cấu hình header IP tin cậy trước triển khai công khai.

### 6.3. Hướng phát triển

Ưu tiên tiếp theo là bổ sung metadata sản phẩm có quản trị và xác minh nguồn; hoàn thiện luồng trạng thái đơn và ghi nhận COD/chuyển khoản; cải thiện chất lượng tìm kiếm tiếng Việt; bổ sung cảnh báo tồn thấp. Có thể mở rộng kiểm duyệt/phản hồi đánh giá, quản lý vòng đời lịch sử chat, thông báo email, vận chuyển, thanh toán cổng và hạ tầng nhiều người dùng.

### 6.4. Kết luận dùng cho báo cáo

Figure Shop minh họa một ứng dụng thương mại điện tử bán mô hình với giao diện khách hàng, quản trị và tư vấn AI. Điểm trọng tâm về kỹ thuật là phân lớp nghiệp vụ, tính giá thống nhất, transaction tạo đơn, dữ liệu snapshot, quản lý nhiều danh mục và tách lớp thanh toán tổng/lần thử/sự kiện. Phần bảo vệ đồ án nên trình bày rõ đâu là tính năng demo đã vận hành, đâu là cấu trúc mở rộng và đâu là yêu cầu còn cần hoàn thiện.

## 7. Nguồn đối chiếu trong mã nguồn

Các đường dẫn dưới đây tính từ thư mục figure-shop. Đây là nguồn nội bộ dùng kiểm chứng báo cáo, không chứa khóa API hay dữ liệu cá nhân.

| Nguồn | Nội dung đối chiếu |
|---|---|
| package.json; package-lock.json | Công nghệ và phiên bản dependency. |
| prisma/schema.prisma; prisma/migrations | Model, enum, khóa, quan hệ và cấu trúc migration. |
| src/services/product.service.ts | Tìm kiếm, lọc, phân trang, đọc sản phẩm. |
| src/services/pricing.service.ts; promotion.service.ts | Công thức tính giá, chọn ưu đãi, loại pre-order. |
| src/services/cart.service.ts; order.service.ts | Giỏ, tạo đơn, tồn kho, coupon và snapshot. |
| src/services/payment.service.ts; online-payment.service.ts; payment/ | Demo và tích hợp thanh toán mở rộng. |
| src/lib/auth.ts; jwt.ts; password.ts; permissions.ts; api-auth.ts | Phiên, băm mật khẩu, phân quyền. |
| src/proxy.ts; src/lib/payment-http.ts | Bảo vệ route và kiểm tra request thanh toán. |
| src/services/ai.service.ts; ai-product.service.ts | Hội thoại, function calling và dữ liệu cho AI. |
| src/lib/admin-revenue.ts; src/services/admin-revenue.service.ts | Điều kiện ghi nhận và tổng hợp doanh thu. |
| src/components/product/Wishlist.tsx; WishlistProducts.tsx; account/AccountDataProvider.tsx | Yêu thích theo tài khoản, danh sách khách lưu cục bộ. |

## 8. Chi tiết các cập nhật ngày 13/09/2026

### 8.1. Đổi loại hàng trong admin

Nhân viên mở Admin → Sản phẩm → Đổi loại hàng, chọn Pre-order hoặc In-stock. In-stock yêu cầu tồn kho nguyên không âm; 0 nghĩa là hết hàng. Khi chuyển Pre-order, thao tác nhanh giữ giá trị tồn đã có và tắt Promotion trực tiếp trong cùng transaction. Khi quay lại In-stock, ưu đãi trực tiếp không tự bật lại. Loại hàng khác với trạng thái công bố ACTIVE/DRAFT/ARCHIVED. Thao tác không sửa giá, ảnh, trạng thái công bố hoặc các dòng OrderItem cũ. Quy tắc này mô tả nút đổi loại nhanh; trang chỉnh sửa đầy đủ vẫn có các trường loại hàng và tồn kho.

### 8.2. Phân tích luồng đánh giá

Khách đăng nhập mở chi tiết đơn COMPLETED và chọn Đánh giá sản phẩm, hoặc mở mục đánh giá trên trang sản phẩm. Server kiểm tra có OrderItem tham chiếu sản phẩm trong đơn COMPLETED của chính tài khoản; đơn PENDING, SHIPPED hoặc CANCELLED không đủ điều kiện. Điều kiện hiện tại không yêu cầu paymentStatus=PAID và không loại đơn demo nội bộ. Khách nhập 1–5 sao cùng nhận xét đã trim từ 10 đến 2.000 ký tự. Upsert theo cặp userId/productId tạo mới hoặc sửa đúng bản ghi. Xóa chỉ tác động bản ghi của tài khoản đang xác thực.

Khách công khai xem tên hiển thị (hoặc “Khách hàng”), điểm sao, nhận xét và thời điểm; API không công khai email, số điện thoại hoặc userId. Điểm trung bình và phân bố sao được tổng hợp từ database, không tạo đánh giá mẫu trên dữ liệu thật. Danh sách 5 nhận xét/trang, mới nhất trước. Sản phẩm không ACTIVE không nhận đánh giá mới hoặc trả danh sách công khai qua API. Chưa có luồng kiểm duyệt của admin.

### 8.3. Thiết kế bốn bảng mới

| Bảng | Dữ liệu và ràng buộc chính |
|---|---|
| WishlistItem | userId, productId, createdAt; PK(userId, productId); index(productId). |
| AiConversation | id CUID, userId, title, createdAt, updatedAt; index(userId, updatedAt). |
| AiMessage | id Int tự tăng, conversationId, role String, content String, products Json nullable, createdAt; index(conversationId, id). products là snapshot các thẻ sản phẩm trong câu trả lời, không phải FK. |
| ProductReview | id CUID, userId, productId, rating Int, comment String, createdAt, updatedAt; unique(userId, productId), index(productId, createdAt). |

User và Product có các trường quan hệ Prisma tương ứng; các trường relation không tạo cột scalar mới trên hai bảng này. Giới hạn rating và comment được thực thi bằng Zod/service, không phải CHECK trong migration SQLite. AiMessage.role là String trong schema, luồng ghi server chỉ tạo user/assistant. Điều kiện đã mua tra qua Order/OrderItem; ProductReview không lưu FK orderId. Migration 20260913030607_account_wishlist_chat và 20260913032232_product_reviews đã được áp dụng tại localhost. Từ điển đầy đủ được sinh lại từ schema trong phụ lục.

### 8.4. Phân quyền và kiểm thử bổ sung

API thay đổi dữ liệu kiểm tra phiên đăng nhập và nguồn yêu cầu. Wishlist, chat và đánh giá đối chiếu X-Account-Id với tài khoản xác thực để phát hiện phiên đã thay đổi; header này không thay thế xác thực và không quyết định chủ dữ liệu. AccountDataProvider được khởi tạo lại theo tài khoản, kiểm tra phiên khi tab nhận focus. API đánh giá có dữ liệu cá nhân ownReview/eligible nên cũng dùng private, no-store.

| Kiểm thử | Kết quả đã chạy |
|---|---|
| scripts/product-availability-test.ts | Hai chiều chuyển loại; số lượng không hợp lệ/0; tắt ưu đãi; bảo toàn trường không liên quan; từ chối id không tồn tại. |
| scripts/account-data-test.ts | Wishlist không trùng, tách tài khoản; khôi phục chat; không nối tiếp chat của người khác; cascade. |
| scripts/account-data-http-test.ts | HTTP từ chối khách chưa đăng nhập, sai nguồn và phiên không khớp; dữ liệu tài khoản khác không bị lộ. |
| scripts/review-test.ts | Điều kiện đơn hoàn thành; kiểm tra sao/nhận xét; sửa không trùng; xóa theo chủ; tổng hợp, phân trang và lưu bền. |
| scripts/review-http-test.ts | API tạo/sửa/xóa và phân quyền; HTML trang sản phẩm và đường dẫn đánh giá trong đơn hoàn thành. |
| Build/lint | npm run build và npm run lint thành công sau thay đổi. |

Các kiểm thử có ghi dữ liệu dùng database SQLite riêng trong .payment-test; không chỉnh sửa đơn hay tạo nhận xét giả trên database sử dụng của cửa hàng. Kiểm thử lưu lịch sử không gọi API OpenAI có phí. Kiểm thử HTTP/HTML không thay thế kiểm tra tương tác trình duyệt hoặc bố cục trực quan.
| src/components/layout/SearchSuggestions.tsx; src/app/api/products/suggestions/route.ts | Gợi ý tìm kiếm và giới hạn kết quả. |

## PHỤ LỤC A. TỪ ĐIỂN DỮ LIỆU ĐẦY ĐỦ

## 9. Cập nhật quản trị người dùng và báo cáo ngày 20/09/2026

Trước cập nhật này, Sidebar có liên kết Người dùng/Báo cáo nhưng chưa có trang; thống kê tổng User trên Dashboard không đồng nghĩa đã triển khai quản trị tài khoản. Sau cập nhật, /admin/users và /admin/users/[id] đã có giao diện cùng service và API thực tế. Báo cáo chỉ mô tả các chức năng đã triển khai dưới đây.

### 9.1. Phân quyền, danh sách và chi tiết

Chỉ ADMIN quản trị người dùng. Danh sách tìm theo tên/email/điện thoại, lọc CUSTOMER/STAFF/ADMIN và hoạt động/bị khóa, 20 tài khoản mỗi trang. Chi tiết hiển thị thông tin tài khoản, tổng số đơn/đánh giá/yêu thích và 10 đơn gần nhất. Không truy xuất passwordHash trong dữ liệu trả về, không hiển thị nội dung chat riêng tư. STAFF vẫn dùng các chức năng vận hành và báo cáo, không có quyền quản lý tài khoản.

### 9.2. Đổi vai trò và khóa/mở tài khoản

ADMIN chọn vai trò và trạng thái trên trang chi tiết, xác nhận trước khi lưu. Server xác thực ADMIN đang hoạt động, từ chối tự thay đổi quyền/trạng thái của bản thân, kiểm tra expectedVersion và bảo đảm ít nhất một ADMIN hoạt động. Kiểm tra và ghi được thực hiện trong transaction. Dữ liệu đã bị cập nhật từ màn hình khác trả 409 để tránh ghi đè cũ. Không có thao tác xóa cứng User; khóa không xóa đơn, đánh giá, wishlist hoặc lịch sử chat.

User bổ sung isActive Boolean mặc định true và sessionVersion Int mặc định 0 qua migration 20260920114432_user_access_management. Mỗi lần quyền hoặc trạng thái thực sự thay đổi tăng sessionVersion. Phiên JWT cũ không còn khớp nên bị từ chối kể cả sau khi mở khóa; người dùng phải đăng nhập lại. Tài khoản bị khóa không đăng nhập được. Phiên còn hạn cũng phải qua kiểm tra trạng thái database; vai trò trong JWT không phải căn cứ duy nhất cho quyền hiện tại. Tổng số model vẫn là 20; thay đổi này thêm hai cột User.

### 9.3. Báo cáo riêng

/admin/reports dành cho STAFF/ADMIN, dùng getAdminRevenueReport và RevenueOverview với Dashboard để không phát sinh hai cách tính. Bộ lọc 7/30/90 ngày giữ người dùng ở trang báo cáo. Có tổng đã thanh toán, so sánh kỳ trước, số đơn, giá trị chờ thanh toán, biểu đồ COD/chuyển khoản-demo và bảng từng ngày. Đây là báo cáo nội bộ; tiền demo được ghi rõ là mô phỏng. Chưa có xuất Excel/PDF hoặc bộ lọc khoảng ngày tùy ý.

### 9.4. Kiểm thử và giới hạn

scripts/admin-users-http-test.ts dùng database riêng để kiểm tra ADMIN/STAFF/CUSTOMER, danh sách/chi tiết, lọc, không lộ mật khẩu, từ chối nguồn lạ và đầu vào sai, không tự hạ quyền/khóa, thu hồi phiên khi đổi quyền và khóa/mở, từ chối đăng nhập tài khoản khóa, truy cập trang báo cáo và bảo toàn ADMIN khi có yêu cầu hạ quyền cạnh tranh. Build và ESLint được chạy cho thay đổi này. Chưa có nhật ký ai đổi quyền, tạo tài khoản hộ, đặt lại mật khẩu hoặc chức năng nhập/xuất người dùng; đây là hướng mở rộng, không ghi là đã triển khai.

Phụ lục sau được trích trực tiếp từ schema.prisma tại thời điểm tạo tài liệu. Bảng liệt kê các cột scalar; quan hệ object và chỉ mục được ghi riêng. Kiểu có ? là nullable. “Bắt buộc” nghĩa là không nullable, không đồng nghĩa người dùng phải nhập nếu có giá trị mặc định.

### User

Lưu tài khoản, thông tin liên hệ và vai trò; không lưu mật khẩu dạng rõ.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| email | String | Email đăng nhập | Không null; @unique |
| name | String? | Tên hiển thị | Cho phép null |
| phone | String? | Số điện thoại | Cho phép null |
| passwordHash | String | Mật khẩu đã băm | Không null |
| role | Role | Vai trò | Không null; @default(CUSTOMER) |
| isActive | Boolean | Cờ hoạt động | Không null; @default(true) |
| sessionVersion | Int | Phiên bản xác thực; tăng khi đổi quyền hoặc trạng thái để thu hồi token cũ | Không null; @default(0) |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Quan hệ Prisma (không phải cột scalar):
- addresses : Address[]
- cart : Cart?
- orders : Order[]
- wishlist : WishlistItem[]
- conversations : AiConversation[]
- reviews : ProductReview[]

### Address

Địa chỉ thuộc người dùng. Cờ isDefault chưa có unique có điều kiện để bảo đảm một địa chỉ mặc định.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| userId | String | FK người dùng | Không null |
| fullName | String | Họ tên người nhận | Không null |
| phone | String | Số điện thoại | Không null |
| province | String | Tỉnh/thành | Không null |
| district | String | Quận/huyện | Không null |
| ward | String | Phường/xã | Không null |
| detail | String | Địa chỉ cụ thể | Không null |
| isDefault | Boolean | Địa chỉ mặc định | Không null; @default(false) |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Quan hệ Prisma (không phải cột scalar):
- user : User @relation(fields: [userId], references: [id], onDelete: Cascade)

### Category

Danh mục sản phẩm, tham gia quan hệ danh mục chính và nhiều danh mục qua bảng nối.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| name | String | Tên hiển thị | Không null |
| slug | String | Định danh URL | Không null; @unique |
| description | String? | Mô tả | Cho phép null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Quan hệ Prisma (không phải cột scalar):
- products : Product[] @relation("PrimaryProductCategory")
- productLinks : ProductCategory[]
- promotions : Promotion[]

### Brand

Thương hiệu mô hình; có thể là mục tiêu khuyến mãi.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| name | String | Tên hiển thị | Không null |
| slug | String | Định danh URL | Không null; @unique |
| description | String? | Mô tả | Cho phép null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Quan hệ Prisma (không phải cột scalar):
- products : Product[]
- promotions : Promotion[]

### Product

Thông tin sản phẩm và tồn kho hiện tại; không thay thế dữ liệu lịch sử trong OrderItem.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| name | String | Tên hiển thị | Không null |
| slug | String | Định danh URL | Không null; @unique |
| description | String? | Mô tả | Cho phép null |
| price | Int | Đơn giá gốc VND | Không null |
| stock | Int | Tồn kho | Không null; @default(0) |
| status | ProductStatus | Trạng thái theo enum | Không null; @default(DRAFT) |
| type | ProductType | Loại theo enum | Không null; @default(IN_STOCK) |
| categoryId | String? | FK danh mục | Cho phép null |
| brandId | String? | FK thương hiệu | Cho phép null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Quan hệ Prisma (không phải cột scalar):
- category : Category? @relation("PrimaryProductCategory", fields: [categoryId], references: [id])
- categories : ProductCategory[]
- brand : Brand? @relation(fields: [brandId], references: [id])
- images : ProductImage[]
- promotion : Promotion?
- cartItems : CartItem[]
- orderItems : OrderItem[]
- wishlistItems : WishlistItem[]
- reviews : ProductReview[]

### WishlistItem

Yêu thích theo tài khoản; khóa chính kép userId/productId, không lưu trùng.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| userId | String | FK người dùng | Không null |
| productId | String | FK sản phẩm | Không null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |

Khóa/chỉ mục nhiều trường: @@id([userId, productId]); @@index([productId]).

Quan hệ Prisma (không phải cột scalar):
- user : User @relation(fields: [userId], references: [id], onDelete: Cascade)
- product : Product @relation(fields: [productId], references: [id], onDelete: Cascade)

### ProductReview

Đánh giá sao và nhận xét; mỗi cặp tài khoản/sản phẩm một bản ghi.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| userId | String | FK người dùng | Không null |
| productId | String | FK sản phẩm | Không null |
| rating | Int | Điểm sao 1–5, kiểm tra ở ứng dụng | Không null |
| comment | String | Nhận xét 10–2.000 ký tự, kiểm tra ở ứng dụng | Không null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Khóa/chỉ mục nhiều trường: @@unique([userId, productId]); @@index([productId, createdAt]).

Quan hệ Prisma (không phải cột scalar):
- user : User @relation(fields: [userId], references: [id], onDelete: Cascade)
- product : Product @relation(fields: [productId], references: [id], onDelete: Cascade)

### AiConversation

Cuộc trò chuyện thuộc một tài khoản; tiêu đề và thời gian dùng chọn lại lịch sử.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| userId | String | FK người dùng | Không null |
| title | String | Tiêu đề cuộc trò chuyện | Không null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Khóa/chỉ mục nhiều trường: @@index([userId, updatedAt]).

Quan hệ Prisma (không phải cột scalar):
- user : User @relation(fields: [userId], references: [id], onDelete: Cascade)
- messages : AiMessage[]

### AiMessage

Tin nhắn trong hội thoại; nội dung, vai trò và snapshot thẻ sản phẩm dạng JSON.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | Int | Mã bản ghi | Không null; @id @default(autoincrement()) |
| conversationId | String | FK cuộc trò chuyện | Không null |
| role | String | Vai trò | Không null |
| content | String | Nội dung tin nhắn | Không null |
| products | Json? | Snapshot thẻ sản phẩm JSON trong câu trả lời AI | Cho phép null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |

Khóa/chỉ mục nhiều trường: @@index([conversationId, id]).

Quan hệ Prisma (không phải cột scalar):
- conversation : AiConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

### ProductCategory

Bảng nối nhiều–nhiều giữa sản phẩm và danh mục.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| productId | String | FK sản phẩm | Không null |
| categoryId | String | FK danh mục | Không null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |

Khóa/chỉ mục nhiều trường: @@id([productId, categoryId]); @@index([categoryId]).

Quan hệ Prisma (không phải cột scalar):
- product : Product @relation(fields: [productId], references: [id], onDelete: Cascade)
- category : Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

### Promotion

Ưu đãi theo sản phẩm, danh mục hoặc thương hiệu. Mục tiêu phù hợp scope do ứng dụng quản lý.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| scope | PromotionScope | Phạm vi khuyến mãi | Không null; @default(PRODUCT) |
| productId | String? | FK sản phẩm | Cho phép null; @unique |
| categoryId | String? | FK danh mục | Cho phép null |
| brandId | String? | FK thương hiệu | Cho phép null |
| name | String | Tên hiển thị | Không null |
| type | PromotionType | Loại theo enum | Không null |
| value | Int | Giá trị phần trăm hoặc VND | Không null |
| startsAt | DateTime | Bắt đầu hiệu lực | Không null |
| endsAt | DateTime | Kết thúc hiệu lực | Không null |
| isActive | Boolean | Cờ hoạt động | Không null; @default(true) |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Khóa/chỉ mục nhiều trường: @@index([isActive, startsAt, endsAt]); @@index([scope, categoryId]); @@index([scope, brandId]).

Quan hệ Prisma (không phải cột scalar):
- product : Product? @relation(fields: [productId], references: [id], onDelete: Cascade)
- category : Category? @relation(fields: [categoryId], references: [id], onDelete: Cascade)
- brand : Brand? @relation(fields: [brandId], references: [id], onDelete: Cascade)

### Coupon

Mã giảm giá cấp giỏ/đơn, có điều kiện giá trị tối thiểu và giới hạn sử dụng.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| code | String | Mã coupon | Không null; @unique |
| name | String | Tên hiển thị | Không null |
| type | CouponType | Loại theo enum | Không null |
| value | Int | Giá trị phần trăm hoặc VND | Không null |
| minOrderValue | Int | Giá trị đơn tối thiểu | Không null; @default(0) |
| maxDiscountAmount | Int? | Trần giảm VND | Cho phép null |
| usageLimit | Int? | Giới hạn lượt | Cho phép null |
| usedCount | Int | Số lượt sử dụng/đã giữ | Không null; @default(0) |
| startsAt | DateTime | Bắt đầu hiệu lực | Không null |
| endsAt | DateTime | Kết thúc hiệu lực | Không null |
| isActive | Boolean | Cờ hoạt động | Không null; @default(true) |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Khóa/chỉ mục nhiều trường: @@index([isActive, startsAt, endsAt]).

Quan hệ Prisma (không phải cột scalar):
- orders : Order[]
- carts : Cart[]

### ProductImage

Đường dẫn và thứ tự ảnh. Dữ liệu file ảnh nằm ngoài database.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| productId | String | FK sản phẩm | Không null |
| url | String | URL ảnh | Không null |
| alt | String? | Mô tả thay thế ảnh | Cho phép null |
| sortOrder | Int | Thứ tự hiển thị | Không null; @default(0) |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |

Quan hệ Prisma (không phải cột scalar):
- product : Product @relation(fields: [productId], references: [id], onDelete: Cascade)

### Cart

Giỏ của người dùng, có thể gắn một coupon.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| userId | String | FK người dùng | Không null; @unique |
| couponId | String? | FK coupon | Cho phép null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Quan hệ Prisma (không phải cột scalar):
- user : User @relation(fields: [userId], references: [id], onDelete: Cascade)
- coupon : Coupon? @relation(fields: [couponId], references: [id], onDelete: SetNull)
- items : CartItem[]

### CartItem

Dòng sản phẩm trong giỏ; duy nhất theo cặp cartId/productId.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| cartId | String | FK giỏ | Không null |
| productId | String | FK sản phẩm | Không null |
| quantity | Int | Số lượng | Không null; @default(1) |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Khóa/chỉ mục nhiều trường: @@unique([cartId, productId]).

Quan hệ Prisma (không phải cột scalar):
- cart : Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)
- product : Product @relation(fields: [productId], references: [id], onDelete: Cascade)

### Order

Đơn hàng, thông tin người nhận, tổng tiền và dữ liệu điều phối thanh toán.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| orderNumber | String | Mã đơn cho người dùng | Không null; @unique |
| userId | String | FK người dùng | Không null |
| status | OrderStatus | Trạng thái theo enum | Không null; @default(PENDING) |
| paymentMethod | PaymentMethod | Phương thức thanh toán | Không null; @default(COD) |
| paymentStatus | PaymentStatus | Trạng thái thanh toán của đơn | Không null; @default(UNPAID) |
| checkoutKey | String? | Khóa chống lặp checkout | Cho phép null |
| checkoutPayloadHash | String? | Hash dữ liệu checkout | Cho phép null |
| paymentExpiresAt | DateTime? | Hạn thanh toán | Cho phép null |
| cancelRequestedAt | DateTime? | Thời điểm yêu cầu hủy | Cho phép null |
| reservationReleasedAt | DateTime? | Thời điểm hoàn giữ chỗ | Cho phép null |
| couponUsageReserved | Boolean | Đã giữ lượt coupon | Không null; @default(false) |
| isTestOrder | Boolean | Cờ đơn thử nghiệm | Không null; @default(false) |
| subtotal | Int | Tạm tính trước giảm | Không null |
| discountAmount | Int | Tổng giảm theo cấp bản ghi | Không null; @default(0) |
| shippingFee | Int | Phí vận chuyển | Không null; @default(0) |
| total | Int | Tổng tiền sau tính toán | Không null |
| note | String? | Ghi chú | Cho phép null |
| couponId | String? | FK coupon | Cho phép null |
| couponCode | String? | Snapshot mã coupon | Cho phép null |
| couponDiscountAmount | Int | Giảm coupon VND | Không null; @default(0) |
| receiverName | String | Tên người nhận | Không null |
| receiverPhone | String | Điện thoại người nhận | Không null |
| province | String | Tỉnh/thành | Không null |
| district | String | Quận/huyện | Không null |
| ward | String | Phường/xã | Không null |
| addressDetail | String | Địa chỉ giao chi tiết | Không null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Khóa/chỉ mục nhiều trường: @@unique([userId, checkoutKey]); @@index([paymentExpiresAt, reservationReleasedAt]).

Quan hệ Prisma (không phải cột scalar):
- user : User @relation(fields: [userId], references: [id], onDelete: Cascade)
- coupon : Coupon? @relation(fields: [couponId], references: [id], onDelete: SetNull)
- items : OrderItem[]
- payment : Payment?

### OrderItem

Snapshot dòng hàng, giá tại thời điểm đặt và số lượng tồn đã giữ.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| orderId | String | FK đơn hàng | Không null |
| productId | String? | FK sản phẩm | Cho phép null |
| productName | String | Snapshot tên sản phẩm | Không null |
| productPrice | Int | Đơn giá sau giảm khi đặt | Không null |
| originalPrice | Int | Đơn giá gốc khi đặt | Không null; @default(0) |
| finalPrice | Int | Đơn giá sau Promotion | Không null; @default(0) |
| discountAmount | Int | Tổng giảm theo cấp bản ghi | Không null; @default(0) |
| quantity | Int | Số lượng | Không null |
| reservedQuantity | Int | Số lượng tồn được giữ | Không null; @default(0) |
| total | Int | Tổng tiền sau tính toán | Không null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |

Quan hệ Prisma (không phải cột scalar):
- order : Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
- product : Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

### Payment

Khoản thanh toán tổng của đơn; phân biệt môi trường và cờ cần đối soát.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| orderId | String | FK đơn hàng | Không null; @unique |
| amount | Int | Số tiền thanh toán VND | Không null |
| method | PaymentMethod | Phương thức | Không null |
| status | PaymentStatus | Trạng thái theo enum | Không null; @default(UNPAID) |
| transactionCode | String? | Mã giao dịch | Cho phép null |
| paidAt | DateTime? | Thời điểm đã thanh toán | Cho phép null |
| environment | PaymentEnvironment | Môi trường giao dịch | Không null; @default(LEGACY) |
| needsReview | Boolean | Cần đối soát thủ công | Không null; @default(false) |
| reviewReason | String? | Lý do cần đối soát | Cho phép null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Quan hệ Prisma (không phải cột scalar):
- attempts : PaymentAttempt[]
- order : Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

### PaymentAttempt

Lần thử thanh toán qua cổng; mã tham chiếu, khóa chống lặp và khóa điều phối.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| paymentId | String | FK khoản thanh toán | Không null |
| provider | PaymentMethod | Nhà cung cấp/phương thức | Không null |
| environment | PaymentEnvironment | Môi trường giao dịch | Không null |
| merchantAccountId | String | Định danh merchant | Không null |
| providerReference | String | Mã tham chiếu gửi cổng | Không null; @unique |
| providerPaymentId | String? | Mã thanh toán phía cổng | Cho phép null |
| providerCreatedAt | String | Chuỗi thời gian gửi cổng | Không null |
| amount | Int | Số tiền thanh toán VND | Không null |
| currency | String | Mã tiền tệ | Không null; @default("VND") |
| status | PaymentAttemptStatus | Trạng thái theo enum | Không null; @default(CREATING) |
| activePaymentId | String? | Khóa duy nhất lần thử hoạt động, không FK | Cho phép null; @unique |
| requestKey | String | Khóa yêu cầu chống lặp | Không null; @unique |
| checkoutUrl | String? | URL chuyển sang cổng | Cho phép null |
| expiresAt | DateTime | Hạn hiệu lực lần thử | Không null |
| lastReconciledAt | DateTime? | Lần đối soát gần nhất | Cho phép null |
| leaseUntil | DateTime? | Hạn khóa xử lý | Cho phép null |
| leaseToken | String? | Token khóa xử lý | Cho phép null |
| createdAt | DateTime | Thời điểm tạo | Không null; @default(now()) |
| updatedAt | DateTime | Thời điểm cập nhật | Không null; @updatedAt |

Khóa/chỉ mục nhiều trường: @@index([status, expiresAt]); @@index([paymentId, createdAt]).

Quan hệ Prisma (không phải cột scalar):
- payment : Payment @relation(fields: [paymentId], references: [id])
- events : PaymentEvent[]

### PaymentEvent

Sự kiện của lần thử, dùng đối chiếu và chống xử lý lặp bằng eventKey.

| Trường | Kiểu Prisma | Ý nghĩa | Ràng buộc / mặc định |
|---|---|---|---|
| id | String | Mã bản ghi | Không null; @id @default(cuid()) |
| attemptId | String | FK lần thử | Không null |
| eventKey | String | Khóa sự kiện chống lặp | Không null; @unique |
| providerTransactionId | String? | Mã giao dịch nhà cung cấp | Cho phép null |
| amount | Int | Số tiền thanh toán VND | Không null |
| result | String | Kết quả xử lý | Không null |
| receivedAt | DateTime | Thời điểm nhận | Không null; @default(now()) |
| processedAt | DateTime | Thời điểm xử lý | Không null; @default(now()) |

Quan hệ Prisma (không phải cột scalar):
- attempt : PaymentAttempt @relation(fields: [attemptId], references: [id])

## PHỤ LỤC B. CÁC ENUM TRONG SCHEMA

### Role

CUSTOMER, STAFF, ADMIN.

### ProductStatus

ACTIVE, DRAFT, ARCHIVED.

### ProductType

IN_STOCK, PREORDER.

### PromotionType

PERCENTAGE, FIXED_AMOUNT.

### PromotionScope

PRODUCT, CATEGORY, BRAND.

### CouponType

PERCENTAGE, FIXED_AMOUNT.

### OrderStatus

PENDING, CONFIRMED, PROCESSING, SHIPPED, COMPLETED, CANCELLED.

### PaymentMethod

COD, BANK_TRANSFER, DEMO, PAYOS, VNPAY.

### PaymentEnvironment

LEGACY, DEMO, SANDBOX, LIVE.

### PaymentAttemptStatus

CREATING, PENDING, UNKNOWN, SUCCEEDED, FAILED, CANCELLED, EXPIRED.

### PaymentStatus

UNPAID, PAID, FAILED, REFUNDED.
