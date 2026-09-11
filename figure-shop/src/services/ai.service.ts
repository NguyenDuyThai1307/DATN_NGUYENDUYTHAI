import OpenAI from "openai";
import {
  compareProductsForAi,
  getCatalogOverviewForAi,
  getProductDetailsForAi,
  searchProductsForAi,
} from "@/services/ai-product.service";
import type { AiChatResponse, AiProductReference } from "@/types/ai";
import {
  aiProductComparisonSchema,
  aiProductDetailSchema,
  aiProductSearchSchema,
  type AiChatRequest,
} from "@/validations/ai.schema";

const DEFAULT_MODEL = "gpt-5.6-sol";
const MAX_TOOL_ROUNDS = 3;
// Log provider diagnostics without serializing request headers or credentials.
function logAiError(context: string, error: unknown) {
  console.error(context, error instanceof OpenAI.APIError
    ? { status: error.status, code: error.code, type: error.type }
    : { name: error instanceof Error ? error.name : "UnknownError" });
}
const priceFormatter = new Intl.NumberFormat("vi-VN");

type ConversationPreferences = {
  maxPrice?: number;
  requiresInStock: boolean;
  requiresPromotion: boolean;
  preferredSort?: "DISCOUNT";
};

const systemPrompt = `Bạn là trợ lý tư vấn mua sắm của Figure Shop, có phong cách gần gũi, tinh tế và hiểu cách người sưu tầm cân nhắc sản phẩm.

Cách trò chuyện:
- Xưng "mình", gọi khách là "bạn". Viết tiếng Việt tự nhiên, có dấu.
- Trả lời tự nhiên với độ dài phù hợp câu hỏi, thường từ 2-6 câu. Có thể dùng danh sách ngắn khi hướng dẫn nhiều bước.
- Hiểu câu nói đời thường, câu viết tắt, lời chào, lời cảm ơn và câu hỏi nối tiếp; không yêu cầu khách phải dùng câu lệnh hoặc mẫu câu cố định.
- Không chào lại ở mọi lượt, không lặp nguyên văn câu hỏi và không dùng giọng quảng cáo quá mức.
- Không dùng bảng Markdown, tiêu đề Markdown, ký hiệu in đậm, khối mã hoặc thuật ngữ nội bộ như IN_STOCK, PREORDER, slug hay tên công cụ.
- Không đọc lại toàn bộ dữ liệu. Thẻ sản phẩm bên dưới đã hiển thị ảnh, giá và tồn kho; phần trả lời chỉ nêu lựa chọn nổi bật cùng lý do phù hợp.
- Khi có nhiều kết quả, chỉ nhắc tối đa 3 sản phẩm trong lời tư vấn và chỉ ra khác biệt quan trọng.
- Kết thúc bằng một câu hỏi ngắn chỉ khi nó thực sự giúp thu hẹp lựa chọn.
- Ghi nhớ những sở thích khách đã xác nhận trong lịch sử gần đây như ngân sách, series, thương hiệu và việc có chấp nhận đặt trước hay không.

Phạm vi trao đổi tự do:
- Có thể giải thích kiến thức phổ thông về mô hình như mô hình tỉ lệ, Nendoroid, mô hình hành động, chất liệu, cách chọn kích thước, trưng bày, vệ sinh, bảo quản, cân đối ngân sách, chọn quà và những điều cần lưu ý khi đặt trước.
- Kiến thức nền cần chính xác: mô hình tỉ lệ thường có tỉ lệ rõ ràng và dáng cố định; Nendoroid có tỉ lệ chibi, thường thay được khuôn mặt và phụ kiện; mô hình hành động ưu tiên khớp chuyển động. Không đánh đồng các dòng này.
- figma và S.H.Figuarts là những ví dụ phổ biến của mô hình hành động có khớp. POP UP PARADE và Figuarts ZERO chủ yếu là tượng dáng cố định, không giới thiệu chúng như mô hình hành động nhiều khớp.
- Chỉ nêu kích thước, chất liệu hoặc khả năng thay phụ kiện ở mức phổ biến và có từ ngữ như "thường"; tránh khẳng định mọi sản phẩm đều giống nhau.
- Tủ kính hoặc tủ trưng bày thông thường không mặc định chống tia UV; chỉ nói có khả năng lọc UV khi nhà sản xuất tủ công bố rõ.
- Với câu hỏi kiến thức chung, hãy trả lời hữu ích ngay thay vì buộc khách cung cấp ngân sách hoặc chọn một sản phẩm.
- Có thể trò chuyện ngắn gọn về sở thích sưu tầm và giúp khách làm rõ gu của họ.
- Nếu câu hỏi nằm ngoài mô hình, sưu tầm hoặc hoạt động mua sắm của Figure Shop, hãy trả lời lịch sự rằng bạn tập trung vào các chủ đề này và gợi ý một hướng hỏi phù hợp.
- Không biến kiến thức chung thành thông tin riêng của cửa hàng. Nếu không chắc một chi tiết, nói rõ giới hạn thay vì đoán.

Nguyên tắc dữ liệu:
- Giá, tồn kho, khuyến mãi, thương hiệu và danh mục chỉ được nói dựa trên kết quả công cụ. Không tự bịa sản phẩm, chất lượng, chính sách hoặc mã giảm giá.
- Khi khách hỏi gợi ý sản phẩm, phải tìm sản phẩm trước khi trả lời. Khoảng giá là giá thực trả sau khuyến mãi đang hoạt động.
- Khi khách hỏi hàng còn sẵn, dùng type=IN_STOCK và onlyAvailable=true. Khi diễn đạt, nói "còn hàng" hoặc "đặt trước".
- Không tự thêm điều kiện loại hàng, tồn kho, khoảng giá hoặc khuyến mãi nếu khách chưa yêu cầu.
- Tham số query chỉ chứa tên sản phẩm, nhân vật hoặc series; không đưa các cụm chung như "còn hàng", "giá rẻ" hay "đang giảm giá" vào query.
- Nếu khách muốn mua nhưng nhu cầu còn quá chung chung, đưa một gợi ý định hướng hữu ích trước rồi mới hỏi một câu về ngân sách, series yêu thích hoặc khả năng chờ hàng; không đưa danh sách sản phẩm ngẫu nhiên.
- Khi so sánh, tìm slug trước rồi dùng compare_products. So sánh có căn cứ theo giá thực trả, mức giảm, tồn kho, loại, thương hiệu và danh mục; không tự đánh giá chất lượng hay độ đẹp.
- Nếu không có kết quả, nói rõ điều kiện nào chưa tìm thấy và đề xuất nới đúng một điều kiện.
- Bạn chỉ tư vấn; không tự đặt hàng, thanh toán, thay đổi giỏ hàng hoặc sửa dữ liệu quản trị.

Ví dụ về giọng điệu mong muốn:
- "Trong tầm giá này, Luffy phù hợp hơn nếu bạn muốn nhận hàng sớm vì mẫu đang còn sẵn. Miku có mức giảm tốt hơn nhưng cần đặt trước, nên sẽ hợp hơn nếu bạn không vội."
- Với câu hỏi quá chung chung: "Bạn đang ưu tiên series nào và ngân sách khoảng bao nhiêu để mình chọn đúng hơn?"`;

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Tìm sản phẩm đang hiển thị theo tên, mô tả, danh mục, thương hiệu, loại, giá thực trả sau khuyến mãi, tình trạng còn hàng hoặc khuyến mãi.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          category: { type: "string" },
          brand: { type: "string" },
          type: { type: "string", enum: ["IN_STOCK", "PREORDER"] },
          minPrice: {
            type: "integer",
            minimum: 0,
            description: "Giá thực trả tối thiểu sau khuyến mãi, đơn vị VND.",
          },
          maxPrice: {
            type: "integer",
            minimum: 0,
            description: "Giá thực trả tối đa sau khuyến mãi, đơn vị VND.",
          },
          hasPromotion: { type: "boolean" },
          onlyAvailable: {
            type: "boolean",
            description:
              "Chỉ lấy hàng IN_STOCK còn tồn kho; sản phẩm PREORDER vẫn được xem là có thể đặt.",
          },
          sort: {
            type: "string",
            enum: [
              "RELEVANCE",
              "PRICE_ASC",
              "PRICE_DESC",
              "NEWEST",
              "DISCOUNT",
            ],
          },
          limit: {
            type: "integer",
            minimum: 1,
            description:
              "Số kết quả mong muốn. Hệ thống sẽ giới hạn tối đa 10 sản phẩm.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description:
        "Lấy thông tin chi tiết mới nhất của một sản phẩm đang hiển thị bằng slug.",
      parameters: {
        type: "object",
        properties: {
          slug: { type: "string" },
        },
        required: ["slug"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_catalog_overview",
      description:
        "Lấy tổng quan catalog đang hiển thị: số sản phẩm, số hàng còn kho, pre-order, khuyến mãi, khoảng giá, danh mục và thương hiệu.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_products",
      description:
        "Lấy dữ liệu để so sánh từ 2 đến 4 sản phẩm đang hiển thị bằng slug.",
      parameters: {
        type: "object",
        properties: {
          slugs: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 4,
          },
        },
        required: ["slugs"],
        additionalProperties: false,
      },
    },
  },
];

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  return new OpenAI({
    apiKey,
    maxRetries: 1,
    timeout: 20_000,
  });
}

function getReferencedProducts(
  products: Map<string, AiProductReference>,
) {
  return Array.from(products.values()).slice(0, 6);
}

function deriveConversationPreferences(
  input: AiChatRequest,
): ConversationPreferences {
  const userMessages = input.history
    .filter((message) => message.role === "user")
    .map((message) => message.content);
  const conversation = [...userMessages, input.message].join("\n");
  const millionMatches = Array.from(
    conversation.matchAll(
      /(?:dưới|tối đa|không quá)\s+(\d+(?:[.,]\d+)?)\s*(?:triệu|tr\b)/gi,
    ),
  );
  const latestMillionMatch = millionMatches.at(-1)?.[1];
  const maxPrice = latestMillionMatch
    ? Math.round(Number(latestMillionMatch.replace(",", ".")) * 1_000_000)
    : undefined;
  const requiresInStock =
    /không\s+(?:muốn\s+)?(?:chờ|đợi)|không[^.!?\n]{0,30}(?:pre-?order|đặt trước)|còn\s+hàng|hàng\s+có\s+sẵn|nhận\s+hàng\s+sớm/i.test(
      conversation,
    );
  const requiresPromotion =
    /giảm\s+giá|khuyến\s+mãi|flash\s*sale|sale\b/i.test(conversation);
  const prefersHighestDiscount =
    /(?:giảm\s+giá|khuyến\s+mãi)[^.!?\n]{0,40}(?:nhiều|mạnh|cao|tốt)\s+nhất|(?:nhiều|mạnh|cao)\s+nhất[^.!?\n]{0,40}(?:giảm\s+giá|khuyến\s+mãi)/i.test(
      conversation,
    );

  return {
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    requiresInStock,
    requiresPromotion,
    preferredSort: prefersHighestDiscount ? "DISCOUNT" : undefined,
  };
}

function extractComparisonQueries(message: string) {
  const match = message.match(
    /so\s+s[aá]nh\s+(.+?)\s+(?:v[aà]|với|vs\.?)\s+(.+?)(?:[?.!]|$)/i,
  );

  if (!match?.[1] || !match[2]) {
    return null;
  }

  const cleanQuery = (value: string) =>
    value
      .replace(/\s+(?:giúp|cho)\s+(?:mình|tôi|em).*$/i, "")
      .trim();
  const queries = [cleanQuery(match[1]), cleanQuery(match[2])].filter(Boolean);

  return queries.length === 2 ? queries : null;
}

function isGeneralKnowledgeRequest(message: string) {
  const normalized = message.trim();
  const mentionsFigureType =
    /scale(?:\s+figure)?|nendoroid|action\s+figure|figma|resin|pvc|game\s*prize|chibi|mô\s+hình\s+(?:tĩnh|khớp)/i.test(
      normalized,
    );
  const asksAboutTypeDifference =
    mentionsFigureType &&
    /khác(?:\s+nhau)?|như\s+thế\s+nào|thế\s+nào|phân\s+biệt/i.test(
      normalized,
    );
  const mentionsGeneralCollectingTopic =
    /bảo\s+quản|vệ\s+sinh|lau\s+(?:bụi|figure)|bám\s+bụi|trưng\s+bày|tủ\s+kính|ánh\s+nắng|phai\s+màu|ẩm\s+mốc|chất\s+liệu|tỉ\s+lệ|tỷ\s+lệ|kích\s+thước|khớp\s+chuyển\s+động|tạo\s+dáng|mới\s+chơi|sưu\s+tầm/i.test(
      normalized,
    );

  return (
    asksAboutTypeDifference ||
    mentionsGeneralCollectingTopic ||
    /là\s+gì|cách\s+(?:chọn\s+kích\s+thước|bảo\s+quản|vệ\s+sinh|trưng\s+bày)|làm\s+sao\s+để\s+(?:bảo\s+quản|vệ\s+sinh|trưng\s+bày)|mới\s+(?:chơi|sưu\s+tầm)|nên\s+bắt\s+đầu\s+(?:từ\s+đâu|thế\s+nào)/i.test(
      normalized,
    )
  );
}

function hasCatalogIntent(message: string) {
  return /tìm|mua|gợi\s+ý|tư\s+vấn|sản\s+phẩm|mẫu\s+nào|giá|ngân\s+sách|bao\s+nhiêu|triệu|còn\s+hàng|tồn\s+kho|đặt\s+trước|pre-?order|giảm\s+giá|khuyến\s+mãi|coupon|thương\s+hiệu|hãng/i.test(
    message,
  );
}

function shouldUseOpenConversation(input: AiChatRequest) {
  if (hasCatalogIntent(input.message)) {
    return false;
  }

  if (isGeneralKnowledgeRequest(input.message)) {
    return true;
  }

  return input.history
    .slice(-6)
    .some(
      (message) =>
        message.role === "user" && isGeneralKnowledgeRequest(message.content),
    );
}

function extractDirectProductQuery(message: string) {
  const normalized = message.trim();
  const directLookupPrefix =
    /^(?:hãy\s+)?(?:tìm(?:\s+giúp\s+(?:tôi|mình|em))?|xem|cho\s+(?:tôi|mình|em)\s+(?:xem|biết)(?:\s+thêm)?(?:\s+về)?|(?:tôi|mình|em)\s+muốn\s+biết(?:\s+thêm)?(?:\s+về)?|thông\s+tin(?:\s+về)?|kiểm\s+tra|tư\s+vấn(?:\s+thêm)?(?:\s+cho\s+(?:tôi|mình|em))?(?:\s+về)?|mô\s+hình|figure|sản\s+phẩm)(?=\s|$)/i;
  const hasDirectLookupIntent = directLookupPrefix.test(normalized);

  if (
    !hasDirectLookupIntent ||
    normalized.length > 80 ||
    isGeneralKnowledgeRequest(normalized) ||
    /so\s+s[aá]nh|gợi\s+ý|dưới|trên|triệu|giảm\s+giá|khuyến\s+mãi|còn\s+hàng|đặt\s+trước|pre-?order/i.test(
      normalized,
    )
  ) {
    return null;
  }

  const query = normalized
    .replace(directLookupPrefix, "")
    .trimStart()
    .replace(/^(?:về\s+)?(?:mẫu|sản\s+phẩm|mô\s+hình|figure)\s+/i, " ")
    .replace(/\s+(?:giúp\s+(?:tôi|mình|em)|cho\s+(?:tôi|mình|em)|nhé|nha|đi)\s*$/i, " ")
    .replace(/[?!.,]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (
    query.length < 2 ||
    /^(?:nào|gì|đẹp|tốt|phù\s+hợp|giá\s+rẻ|bán\s+chạy)$/i.test(query)
  ) {
    return null;
  }

  return query;
}

function createNoDirectProductMatchMessage(query: string) {
  return `Hiện mình chưa tìm thấy sản phẩm nào khớp với “${query}” trong cửa hàng. Bạn có thể kiểm tra lại tên nhân vật hoặc cho mình một từ khóa khác nhé.`;
}

async function createOpenConversationReply(
  openai: OpenAI,
  input: AiChatRequest,
): Promise<AiChatResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nĐây là hội thoại kiến thức chung, không có dữ liệu catalog đi kèm. Không nêu giá, tồn kho, khuyến mãi hoặc chính sách cụ thể của cửa hàng.\n\nNguồn kiến thức bắt buộc khi phân biệt các dòng mô hình:\n- Mô hình tỉ lệ là tượng theo tỉ lệ, thường có dáng cố định và không có khớp chuyển động.\n- Nendoroid có phong cách chibi, thường thay được khuôn mặt và phụ kiện, có khả năng tạo dáng ở mức giới hạn tùy mẫu.\n- Mô hình hành động ưu tiên khớp chuyển động; figma và S.H.Figuarts là ví dụ phổ biến.\nKhông nêu số lượng khớp hoặc kích thước chính xác nếu không có nguồn dữ liệu cho mẫu cụ thể. Không được viết nội dung mâu thuẫn với các điểm trên.`,
        },
        ...input.history.slice(-10),
        { role: "user", content: input.message },
      ],
      reasoning_effort: "none",
      store: false,
      max_completion_tokens: 700,
    });

    return {
      message: normalizeOpenAssistantMessage(
        completion.choices[0]?.message.content,
      ),
      products: [],
    };
  } catch (error) {
    logAiError("AI open conversation failed", error);
    return {
      message:
        "Mình chưa thể giải thích trọn vẹn chủ đề này lúc này. Bạn thử hỏi lại sau một chút nhé.",
      products: [],
    };
  }
}

function getAvailabilityText(product: AiProductReference) {
  if (product.type === "PREORDER") {
    return "đang nhận đặt trước";
  }

  if (product.stock > 0) {
    return `hiện còn ${product.stock} sản phẩm`;
  }

  return "đang tạm hết hàng";
}

function createComparisonMessage(products: AiProductReference[]) {
  const [firstProduct, secondProduct] = products;

  if (!firstProduct || !secondProduct) {
    return normalizeAssistantMessage(null, products);
  }

  const cheaperProduct =
    firstProduct.finalPrice <= secondProduct.finalPrice
      ? firstProduct
      : secondProduct;
  const priceDifference = Math.abs(
    firstProduct.finalPrice - secondProduct.finalPrice,
  );
  const firstSummary = `${firstProduct.name} có giá ${priceFormatter.format(firstProduct.finalPrice)} đ, ${getAvailabilityText(firstProduct)}, thuộc ${firstProduct.category ?? "danh mục chưa xác định"}${firstProduct.brand ? ` của ${firstProduct.brand}` : ""}.`;
  const secondSummary = `${secondProduct.name} có giá ${priceFormatter.format(secondProduct.finalPrice)} đ, ${getAvailabilityText(secondProduct)}, thuộc ${secondProduct.category ?? "danh mục chưa xác định"}${secondProduct.brand ? ` của ${secondProduct.brand}` : ""}.`;
  const comparison =
    priceDifference > 0
      ? `${cheaperProduct.name} tiết kiệm hơn ${priceFormatter.format(priceDifference)} đ; lựa chọn còn lại phù hợp khi bạn ưu tiên đúng nhân vật hoặc dòng sản phẩm đó.`
      : "Hai mẫu có cùng mức giá, nên khác biệt đáng cân nhắc nhất là tình trạng hàng và dòng sản phẩm.";

  return `${firstSummary} ${secondSummary} ${comparison} Bạn ưu tiên mức giá, nhân vật hay khả năng nhận hàng sớm hơn?`;
}

function createVerifiedProductMessage(products: AiProductReference[]) {
  const [firstProduct, secondProduct] = products;

  if (!firstProduct) {
    return "Mình chưa tìm thấy lựa chọn khớp hoàn toàn. Bạn thử nới ngân sách hoặc cho mình biết thêm series yêu thích nhé.";
  }

  if (!secondProduct) {
    const productContext = [firstProduct.category, firstProduct.brand]
      .filter(Boolean)
      .join(" của ");

    return `Mình gợi ý ${firstProduct.name}${productContext ? `, mẫu ${productContext}` : ""}. Sản phẩm ${getAvailabilityText(firstProduct)} và có giá hiện tại ${priceFormatter.format(firstProduct.finalPrice)} đ. Bạn có thể mở thẻ bên dưới để xem đầy đủ thông tin trước khi chọn.`;
  }

  const visibleProducts = products.slice(0, 3);
  const cheapestProduct = visibleProducts.reduce((cheapest, product) =>
    product.finalPrice < cheapest.finalPrice ? product : cheapest,
  );
  const productNames = visibleProducts.map((product) => product.name).join(", ");

  return `Mình tìm thấy ${products.length} lựa chọn phù hợp, nổi bật là ${productNames}. ${cheapestProduct.name} có mức giá dễ tiếp cận nhất ở ${priceFormatter.format(cheapestProduct.finalPrice)} đ. Bạn xem các thẻ bên dưới rồi cho mình biết mẫu nào hợp gu nhất nhé.`;
}

function extractMentionedMoney(content: string) {
  const amounts: number[] = [];

  for (const match of content.matchAll(/(\d+(?:[.,]\d+)?)\s*(nghìn|triệu)/gi)) {
    const numericValue = Number(match[1]?.replace(",", "."));

    if (Number.isFinite(numericValue)) {
      amounts.push(numericValue * (match[2]?.toLowerCase() === "triệu" ? 1_000_000 : 1_000));
    }
  }

  for (const match of content.matchAll(/([\d.,]+)\s*(?:đ|₫)/gi)) {
    const numericValue = Number(match[1]?.replace(/[.,]/g, ""));

    if (Number.isFinite(numericValue)) {
      amounts.push(numericValue);
    }
  }

  return amounts;
}

function hasUnsupportedProductClaims(
  content: string,
  products: AiProductReference[],
) {
  if (/giao\s+(?:hàng\s+)?nhanh|nhận\s+được\s+nhanh/i.test(content)) {
    return true;
  }

  if (
    /\b1\s*\/\s*\d+\b|độ\s+hoàn\s+thiện|chất\s+lượng\s+(?:cao|tốt)|chi\s+tiết\s+(?:đầy\s+đủ|tinh\s+xảo)/i.test(
      content,
    )
  ) {
    return true;
  }

  if (
    products.some((product) => product.type === "PREORDER") &&
    /còn\s+\d+\s+(?:sản\s+phẩm|chiếc|mẫu)(?:\s+trong\s+kho)?/i.test(content)
  ) {
    return true;
  }

  const allowedAmounts = new Set(
    products.flatMap((product) => [product.originalPrice, product.finalPrice]),
  );

  return extractMentionedMoney(content).some(
    (amount) => !allowedAmounts.has(Math.round(amount)),
  );
}

function normalizeAssistantMessage(
  content: string | null | undefined,
  products: AiProductReference[],
) {
  const normalized = cleanAssistantMessage(content);

  if (normalized && !hasUnsupportedProductClaims(normalized, products)) {
    return normalized;
  }

  if (products.length > 0) {
    return createVerifiedProductMessage(products);
  }

  return "Mình chưa đủ thông tin để tư vấn chính xác. Bạn cho mình biết thêm ngân sách hoặc series yêu thích nhé.";
}

function cleanAssistantMessage(content: string | null | undefined) {
  return (content ?? "")
    .split("\n")
    .filter((line) => !/^\s*\|.*\|\s*$/.test(line))
    .join("\n")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\bIN_STOCK\b/g, "còn hàng")
    .replace(/\bPREORDER\b/g, "đặt trước")
    .replace(
      /bạn (?:có )?muốn mình (?:đặt|mua|thêm)[^?]*\?/gi,
      "Bạn có muốn xem thêm thông tin của mẫu này không?",
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeOpenAssistantMessage(content: string | null | undefined) {
  return (
    cleanAssistantMessage(content) ||
    "Mình chưa thể giải thích trọn vẹn chủ đề này lúc này. Bạn thử hỏi lại sau một chút nhé."
  );
}

async function executeTool(
  name: string,
  rawArguments: string,
  products: Map<string, AiProductReference>,
  preferences?: ConversationPreferences,
) {
  let parsedArguments: unknown;

  try {
    parsedArguments = JSON.parse(rawArguments || "{}");
  } catch {
    return { error: "Tham số công cụ không phải JSON hợp lệ." };
  }

  if (name === "search_products") {
    const searchArguments =
      parsedArguments && typeof parsedArguments === "object"
        ? { ...(parsedArguments as Record<string, unknown>) }
        : {};

    if (preferences?.maxPrice !== undefined) {
      const requestedMaxPrice = searchArguments.maxPrice;
      searchArguments.maxPrice =
        typeof requestedMaxPrice === "number"
          ? Math.min(requestedMaxPrice, preferences.maxPrice)
          : preferences.maxPrice;
    }

    if (preferences?.requiresInStock) {
      searchArguments.type = "IN_STOCK";
      searchArguments.onlyAvailable = true;
    }

    if (preferences?.requiresPromotion) {
      searchArguments.hasPromotion = true;
    }

    if (preferences?.preferredSort) {
      searchArguments.sort = preferences.preferredSort;
    }

    const parsed = aiProductSearchSchema.safeParse(searchArguments);

    if (!parsed.success) {
      return { error: "Điều kiện tìm sản phẩm không hợp lệ." };
    }

    const result = await searchProductsForAi(parsed.data);
    result.forEach((product) => products.set(product.slug, product));
    return { products: result };
  }

  if (name === "get_product_details") {
    const parsed = aiProductDetailSchema.safeParse(parsedArguments);

    if (!parsed.success) {
      return { error: "Slug sản phẩm không hợp lệ." };
    }

    const result = await getProductDetailsForAi(parsed.data.slug);

    if (result) {
      products.set(result.slug, result);
    }

    return { product: result };
  }

  if (name === "get_catalog_overview") {
    return { catalog: await getCatalogOverviewForAi() };
  }

  if (name === "compare_products") {
    const argumentRecord =
      parsedArguments && typeof parsedArguments === "object"
        ? (parsedArguments as Record<string, unknown>)
        : {};
    const suppliedIdentifiers = Array.isArray(argumentRecord.slugs)
      ? argumentRecord.slugs
      : [
          argumentRecord.slug1,
          argumentRecord.slug2,
          argumentRecord.slug3,
          argumentRecord.slug4,
        ];
    const identifiers = suppliedIdentifiers.filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    );
    const resolvedSlugs: string[] = [];

    for (const identifier of identifiers) {
      const detail = await getProductDetailsForAi(identifier.trim());

      if (detail) {
        products.set(detail.slug, detail);
        resolvedSlugs.push(detail.slug);
        continue;
      }

      const matches = await searchProductsForAi({
        query: identifier.trim(),
        limit: 1,
        onlyAvailable: false,
        sort: "RELEVANCE",
      });
      const match = matches[0];

      if (match) {
        products.set(match.slug, match);
        resolvedSlugs.push(match.slug);
      }
    }

    const parsed = aiProductComparisonSchema.safeParse({
      slugs: [...new Set(resolvedSlugs)],
    });

    if (!parsed.success) {
      return { error: "Cần từ 2 đến 4 slug sản phẩm hợp lệ để so sánh." };
    }

    const result = await compareProductsForAi(parsed.data.slugs);
    result.products.forEach((product) => products.set(product.slug, product));
    return result;
  }

  return { error: "Công cụ không được phép." };
}

function createFallbackSearchMessage(
  products: AiProductReference[],
  preferences: ConversationPreferences,
) {
  if (products.length === 0) {
    const conditions = [
      preferences.requiresPromotion ? "đang có khuyến mãi" : null,
      preferences.maxPrice !== undefined
        ? `dưới ${priceFormatter.format(preferences.maxPrice)} đ`
        : null,
      preferences.requiresInStock ? "và còn hàng" : null,
    ]
      .filter(Boolean)
      .join(" ");

    return conditions
      ? `Hiện mình chưa tìm thấy sản phẩm ${conditions}. Bạn có muốn nới một trong các điều kiện để mình tìm thêm không?`
      : "Hiện mình chưa tìm thấy sản phẩm phù hợp. Bạn cho mình biết thêm ngân sách hoặc series yêu thích nhé.";
  }

  const visibleProducts = products.slice(0, 3);
  const productNames = visibleProducts.map((product) => product.name).join(", ");

  if (preferences.preferredSort === "DISCOUNT") {
    const bestDiscount = visibleProducts[0];

    return `Trong ngân sách của bạn, mình tìm thấy ${productNames}. ${bestDiscount.name} đang có mức giảm cao nhất là ${bestDiscount.discountPercent}%, còn ${priceFormatter.format(bestDiscount.finalPrice)} đ. Bạn có muốn mình so sánh các mẫu này kỹ hơn không?`;
  }

  return createVerifiedProductMessage(products);
}

export async function createAiFallbackReply(
  input: AiChatRequest,
): Promise<AiChatResponse> {
  const preferences = deriveConversationPreferences(input);
  const directProductQuery = extractDirectProductQuery(input.message);
  const products = await searchProductsForAi({
    query: directProductQuery ?? undefined,
    maxPrice: preferences.maxPrice,
    type: preferences.requiresInStock ? "IN_STOCK" : undefined,
    hasPromotion: preferences.requiresPromotion ? true : undefined,
    onlyAvailable: preferences.requiresInStock,
    sort:
      preferences.preferredSort ??
      (preferences.maxPrice !== undefined ? "PRICE_ASC" : "RELEVANCE"),
    limit: 6,
  });

  return {
    message:
      directProductQuery && products.length === 0
        ? createNoDirectProductMatchMessage(directProductQuery)
        : createFallbackSearchMessage(products, preferences),
    products,
  };
}

async function createGroundedFinalReply(
  openai: OpenAI,
  input: AiChatRequest,
  toolResults: Array<{ name: string; result: unknown }>,
  products: AiProductReference[],
  fallbackMessage?: string,
) {
  const recentConversation = input.history
    .slice(-8)
    .map((message) =>
      `${message.role === "user" ? "Khách" : "Trợ lý"}: ${message.content}`,
    )
    .join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nBạn đang ở bước viết câu trả lời cuối cùng. Không có công cụ nào khả dụng. Hãy chỉ trả về lời tư vấn bằng văn bản dựa trên dữ liệu được cung cấp. Tuyệt đối không suy luận tỉ lệ, kích thước, chất liệu, độ hoàn thiện, chất lượng hoặc phụ kiện nếu JSON không có trường tương ứng. Với sản phẩm đặt trước, không diễn đạt số stock nội bộ thành số lượng đang có sẵn trong kho.`,
        },
        {
          role: "user",
          content: `${recentConversation ? `Hội thoại gần đây:\n${recentConversation}\n\n` : ""}Yêu cầu hiện tại của khách: ${input.message}\n\nDữ liệu cửa hàng đã xác minh:\n${JSON.stringify(toolResults)}`,
        },
      ],
      reasoning_effort: "none",
      store: false,
      max_completion_tokens: 500,
    });

    return normalizeAssistantMessage(
      completion.choices[0]?.message.content,
      products,
    );
  } catch (error) {
    logAiError("AI final response generation failed", error);
    return fallbackMessage ?? normalizeAssistantMessage(null, products);
  }
}

export async function createAiChatReply(
  input: AiChatRequest,
): Promise<AiChatResponse> {
  const openai = createOpenAIClient();

  if (shouldUseOpenConversation(input)) {
    return createOpenConversationReply(openai, input);
  }

  const referencedProducts = new Map<string, AiProductReference>();
  const toolResults: Array<{ name: string; result: unknown }> = [];
  const preferences = deriveConversationPreferences(input);
  const comparisonQueries = extractComparisonQueries(input.message);

  if (comparisonQueries) {
    const result = await executeTool(
      "compare_products",
      JSON.stringify({ slugs: comparisonQueries }),
      referencedProducts,
    );
    toolResults.push({ name: "compare_products", result });
    const products = getReferencedProducts(referencedProducts);

    return {
      message: await createGroundedFinalReply(
        openai,
        input,
        toolResults,
        products,
        createComparisonMessage(products),
      ),
      products,
    };
  }

  const directProductQuery = extractDirectProductQuery(input.message);

  if (directProductQuery) {
    const directMatches = await searchProductsForAi({
      query: directProductQuery,
      onlyAvailable: false,
      sort: "RELEVANCE",
      limit: 3,
    });

    if (directMatches.length > 0) {
      directMatches.forEach((product) =>
        referencedProducts.set(product.slug, product),
      );
      const products = getReferencedProducts(referencedProducts);
      toolResults.push({
        name: "search_products",
        result: { products: directMatches },
      });

      return {
        message: await createGroundedFinalReply(
          openai,
          input,
          toolResults,
          products,
          createVerifiedProductMessage(products),
        ),
        products,
      };
    }

    return {
      message: createNoDirectProductMatchMessage(directProductQuery),
      products: [],
    };
  }

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...input.history,
    { role: "user", content: input.message },
  ];

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
        messages,
        tools,
        tool_choice: "auto",
        reasoning_effort: "none",
      store: false,
        max_completion_tokens: 700,
      });

      const responseMessage = completion.choices[0]?.message;

      if (!responseMessage) {
        throw new Error("AI_EMPTY_RESPONSE");
      }

      const toolCalls = responseMessage.tool_calls ?? [];

      if (toolCalls.length === 0) {
        const products = getReferencedProducts(referencedProducts);

        if (
          products.length === 0 &&
          toolResults.some((toolResult) => toolResult.name === "search_products")
        ) {
          return {
            message: createFallbackSearchMessage(products, preferences),
            products,
          };
        }

        return {
          message: normalizeAssistantMessage(responseMessage.content, products),
          products,
        };
      }

      messages.push(responseMessage);

      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function") throw new Error("AI_UNSUPPORTED_TOOL_TYPE");
        const result = await executeTool(
          toolCall.function.name,
          toolCall.function.arguments,
          referencedProducts,
          preferences,
        );
        toolResults.push({ name: toolCall.function.name, result });

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }
  } catch (error) {
    logAiError("AI provider request failed; using catalog fallback", error);
    return createAiFallbackReply(input);
  }

  const products = getReferencedProducts(referencedProducts);

  return {
    message: await createGroundedFinalReply(
      openai,
      input,
      toolResults,
      products,
    ),
    products,
  };
}
