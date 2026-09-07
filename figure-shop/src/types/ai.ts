export type AiChatRole = "user" | "assistant";

export type AiChatMessage = {
  role: AiChatRole;
  content: string;
};

export type AiProductReference = {
  slug: string;
  name: string;
  imageUrl: string | null;
  originalPrice: number;
  finalPrice: number;
  stock: number;
  type: "IN_STOCK" | "PREORDER";
  brand: string | null;
  category: string | null;
  promotionLabel: string | null;
  discountPercent: number;
};

export type AiChatResponse = {
  message: string;
  products: AiProductReference[];
};
