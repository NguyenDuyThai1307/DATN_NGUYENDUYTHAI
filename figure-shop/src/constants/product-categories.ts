export const productCategories = [
  {
    name: "Mô hình có khớp",
    slug: "action-figure",
    description:
      "Mô hình nhân vật có khớp chuyển động, phù hợp để tạo dáng và thay phụ kiện.",
  },
  {
    name: "Mô hình tỉ lệ",
    slug: "scale-figure",
    description:
      "Mô hình trưng bày theo tỉ lệ được nhà sản xuất công bố, chú trọng độ hoàn thiện.",
  },
  {
    name: "Nendoroid và mô hình chibi",
    slug: "nendoroid",
    description:
      "Mô hình tạo hình chibi; dòng Nendoroid thường có khuôn mặt và phụ kiện thay thế.",
  },
  {
    name: "Mô hình giải thưởng",
    slug: "prize-figure",
    description:
      "Mô hình tĩnh không tỉ lệ thuộc các dòng giải thưởng, có mức giá dễ tiếp cận.",
  },
  {
    name: "Tượng resin",
    slug: "resin-statue",
    description:
      "Tượng trưng bày bằng resin hoặc polystone, thường có kích thước và độ chi tiết cao.",
  },
  {
    name: "Mô hình lắp ráp",
    slug: "model-kit",
    description:
      "Bộ mô hình được bán theo vỉ hoặc bộ phận để người chơi tự lắp ráp và hoàn thiện.",
  },
  {
    name: "Mô hình mini và hộp mù",
    slug: "mini-blind-box",
    description:
      "Mô hình kích thước nhỏ, trading figure, gashapon và sản phẩm hộp mù.",
  },
  {
    name: "Búp bê sưu tầm",
    slug: "collectible-doll",
    description:
      "Búp bê sưu tầm có khớp, tóc hoặc trang phục vải như BJD và Nendoroid Doll.",
  },
] as const;

export type ProductCategorySlug = (typeof productCategories)[number]["slug"];
