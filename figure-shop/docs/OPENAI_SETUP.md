# AI qua OpenAI

Website dùng SDK `openai`, Chat Completions và các công cụ tìm kiếm, so sánh, tra chi tiết sản phẩm từ database. Mặc định là `gpt-5.6-sol`, reasoning `none`, không lưu completion (`store: false`).

Trong `.env` phía server:

```env
OPENAI_API_KEY="khóa riêng của bạn"
AI_MODEL="gpt-5.6-sol"
```

Không đưa khóa vào biến `NEXT_PUBLIC_*` hoặc Git. Sau khi thay biến môi trường, khởi động lại server nếu chưa tự tải lại.

## Kiểm tra ngày 11/09/2026

- Chuyển sang GPT-5.6 Sol theo yêu cầu: API trả đúng model `gpt-5.6-sol` và gọi function với tham số hợp lệ; TypeScript đạt. Giữ reasoning `none` làm cấu hình cơ sở về độ trễ.

- TypeScript và kiểm thử công cụ AI đã đạt.
- Lần đầu API trả HTTP 429 (`credit_balance_exhausted`). Sau khi bổ sung số dư, gọi trực tiếp đã thành công với `gpt-5.4-mini-2026-03-17`.
- Kiểm tra HTTP `/api/ai/chat`: câu hỏi phân biệt Nendoroid/figma, tìm Naruto còn hàng dưới 2 triệu và câu hỏi nối tiếp đều trả HTTP 200; không có lỗi provider trong log. Chưa phải đánh giá chất lượng toàn diện.
- Khi API lỗi, luồng tư vấn sản phẩm có thể trả dữ liệu dự phòng từ database. Điều này không có nghĩa GPT đã trả lời thành công.
- Chưa đo được mức cải thiện chất lượng so với mô hình cũ.

Web local có thể chạy bằng `npm run dev -- --webpack` nếu Turbopack gặp lỗi tài nguyên Windows (os error 1450).

Khi có số dư, thử hỏi kiến thức chung, tìm sản phẩm theo ngân sách, hỏi tiếp theo lịch sử hội thoại và so sánh hai sản phẩm. Kiểm tra giá/tồn kho với database.

Tài liệu mô hình: https://developers.openai.com/api/docs/models/gpt-5.6-sol
