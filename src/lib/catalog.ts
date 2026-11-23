// Danh mục sản phẩm Fresh Box. Máy chủ cũng dùng chính file này để tính tiền
// đơn hàng, nên giá trên web và giá trong đơn luôn khớp nhau.

export type Product = {
  id: "mini" | "mix" | "premium" | "office" | "family";
  name: string;
  tagline: string;
  price: number;
  image: string;
  badge: string;
  weight: string;
  serves: string;
  fruits: string[];
  short: string;
  description: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "mini",
    name: "Fresh Box Mini",
    tagline: "Hộp trái cây nhỏ",
    price: 25000,
    image: "/assets/img/mini.webp",
    badge: "Bán chạy",
    weight: "khoảng 250g",
    serves: "1 người",
    fruits: ["Dưa hấu", "Xoài", "Nho xanh"],
    short: "Ly trái cây nhỏ xinh, vừa đủ cho bữa phụ nhanh gọn giữa ngày.",
    description:
      "Fresh Box Mini là lựa chọn hoàn hảo cho một bữa phụ lành mạnh. Dưa hấu mọng nước, xoài chín ngọt và nho xanh giòn được cắt miếng vừa ăn, đựng trong ly phân hủy sinh học kèm nĩa gỗ – mang đi học, đi làm hay tập thể thao đều tiện.",
  },
  {
    id: "mix",
    name: "Fresh Box Mix",
    tagline: "Hộp trái cây tổng hợp",
    price: 35000,
    image: "/assets/img/mix.webp",
    badge: "Nhiều màu sắc",
    weight: "khoảng 400g",
    serves: "1–2 người",
    fruits: ["Dưa hấu", "Xoài", "Thanh long", "Dứa", "Nho xanh"],
    short: "Bảy sắc cầu vồng trong một hộp – đủ vitamin cho cả buổi chiều.",
    description:
      "Fresh Box Mix kết hợp 5 loại trái cây tươi theo ngày: dưa hấu, xoài, thanh long ruột đỏ, dứa và nho xanh. Mỗi loại được xếp riêng từng ngăn để giữ trọn hương vị, đóng nắp kín và bảo quản lạnh đến tận tay bạn.",
  },
  {
    id: "premium",
    name: "Fresh Box Premium",
    tagline: "Hộp trái cây cao cấp",
    price: 45000,
    image: "/assets/img/premium.webp",
    badge: "Cao cấp",
    weight: "khoảng 450g",
    serves: "1–2 người",
    fruits: ["Dâu tây", "Kiwi", "Xoài", "Thanh long", "Việt quất", "Nho xanh"],
    short: "Trái cây cao cấp tuyển chọn, hộp kraft buộc dây – sang trọng để biếu tặng.",
    description:
      "Fresh Box Premium dành cho những ai muốn thưởng thức – hoặc gửi tặng – điều tốt nhất. Dâu tây, kiwi, việt quất cùng xoài cát, thanh long và nho xanh được tuyển chọn kỹ, sắp xếp đẹp mắt trong hộp giấy kraft có cửa sổ trong suốt, buộc dây gai tự nhiên.",
  },
  {
    id: "office",
    name: "Fresh Box Office",
    tagline: "Hộp trái cây văn phòng",
    price: 50000,
    image: "/assets/img/office.webp",
    badge: "Cho dân văn phòng",
    weight: "khoảng 600g",
    serves: "2–3 người",
    fruits: ["Dưa hấu", "Xoài", "Thanh long", "Nho xanh", "Trái cây theo mùa"],
    short: "Nạp năng lượng cho buổi họp chiều – chia sẻ cùng đồng nghiệp.",
    description:
      "Fresh Box Office được thiết kế cho giờ giải lao nơi công sở: trái cây cắt miếng nhỏ, dễ chia, kèm nĩa gỗ và khăn giấy. Đặt nhiều hộp cho cả phòng ban để nhận giao hàng đúng giờ hẹn.",
  },
  {
    id: "family",
    name: "Fresh Box Family",
    tagline: "Hộp trái cây gia đình",
    price: 65000,
    image: "/assets/img/family.webp",
    badge: "Tiết kiệm",
    weight: "khoảng 900g",
    serves: "3–4 người",
    fruits: ["Dưa hấu", "Xoài", "Thanh long", "Dứa", "Đu đủ", "Ổi", "Nho xanh"],
    short: "Khay lớn nhiều ngăn cho cả nhà quây quần sau bữa tối.",
    description:
      "Fresh Box Family là khay trái cây cỡ lớn chia nhiều ngăn với 6–7 loại trái cây theo mùa. Đã gọt sạch, cắt sẵn – chỉ cần mở nắp là cả gia đình cùng thưởng thức, không còn cảnh rửa dao thớt sau bữa ăn.",
  },
];

export const PAYMENT_METHODS = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
} as const;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export const ORDER_STATUSES = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  shipping: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy",
} as const;
export type OrderStatus = keyof typeof ORDER_STATUSES;

export const MAX_QTY_PER_ITEM = 50;

export function findProduct(id: string | null | undefined): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatVND(value: number) {
  return formatNumber(value) + " VNĐ";
}

export function clampQty(q: unknown) {
  const n = Math.floor(Number(q));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(MAX_QTY_PER_ITEM, n);
}

export type CartItem = { id: string; quantity: number };
export type CartLine = Product & { quantity: number; lineTotal: number };

/** Tính giỏ hàng từ danh sách (id, số lượng) – dùng chung cho trình duyệt và máy chủ. */
export function computeCart(items: CartItem[]) {
  const lines: CartLine[] = [];
  for (const i of items) {
    const p = findProduct(i.id);
    const quantity = clampQty(i.quantity);
    if (!p || quantity <= 0) continue;
    lines.push({ ...p, quantity, lineTotal: p.price * quantity });
  }
  return {
    lines,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    total: lines.reduce((s, l) => s + l.lineTotal, 0),
  };
}
