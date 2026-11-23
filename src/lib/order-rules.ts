// Quy tắc đơn hàng dùng chung cho biểu mẫu (trình duyệt) và máy chủ.
import { z } from "zod";
import { MAX_QTY_PER_ITEM, PAYMENT_METHODS, PRODUCTS } from "./catalog";

export const PHONE_RE = /^0\d{9,10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizePhone(v: string) {
  let p = v.replace(/[\s.\-()]/g, "");
  if (p.startsWith("+84")) p = "0" + p.slice(3);
  return p;
}

export type OrderFormValues = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  paymentMethod: string;
};

export type OrderFieldErrors = Partial<Record<keyof OrderFormValues, string>>;

export function validateOrderForm(raw: OrderFormValues) {
  const values: OrderFormValues = {
    customerName: raw.customerName.trim(),
    phone: normalizePhone(raw.phone.trim()),
    email: raw.email.trim(),
    address: raw.address.trim(),
    note: raw.note.trim(),
    paymentMethod: raw.paymentMethod,
  };
  const errors: OrderFieldErrors = {};
  if (!values.customerName) errors.customerName = "Vui lòng nhập họ và tên.";
  else if (values.customerName.length < 2) errors.customerName = "Họ tên quá ngắn.";
  else if (values.customerName.length > 120) errors.customerName = "Họ tên quá dài.";
  if (!values.phone) errors.phone = "Vui lòng nhập số điện thoại.";
  else if (!PHONE_RE.test(values.phone)) errors.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).";
  if (!values.address) errors.address = "Vui lòng nhập địa chỉ giao hàng.";
  else if (values.address.length < 8) errors.address = "Vui lòng nhập địa chỉ chi tiết hơn.";
  else if (values.address.length > 400) errors.address = "Địa chỉ quá dài.";
  if (values.email && (!EMAIL_RE.test(values.email) || values.email.length > 200)) errors.email = "Email không hợp lệ.";
  if (values.note.length > 1000) errors.note = "Ghi chú tối đa 1000 ký tự.";
  if (!(values.paymentMethod in PAYMENT_METHODS)) errors.paymentMethod = "Vui lòng chọn phương thức thanh toán.";
  return { values, errors };
}

const productIds = PRODUCTS.map((p) => p.id) as [string, ...string[]];

export const orderInputSchema = z.object({
  customerName: z.string().max(200),
  phone: z.string().max(30),
  email: z.string().max(250),
  address: z.string().max(500),
  note: z.string().max(1200),
  paymentMethod: z.string().max(10),
  website: z.string().max(200).optional(),
  items: z
    .array(z.object({ id: z.enum(productIds), quantity: z.number().int().min(1).max(MAX_QTY_PER_ITEM) }))
    .min(1)
    .max(PRODUCTS.length),
});
export type OrderInput = z.infer<typeof orderInputSchema>;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Mã đơn dạng FB241123-7KQ2 (ngày theo giờ Việt Nam). */
export function generateOrderCode(now = new Date(), random: (n: number) => Uint8Array = randomBytes) {
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const yy = String(vn.getUTCFullYear()).slice(2);
  const mm = String(vn.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(vn.getUTCDate()).padStart(2, "0");
  const bytes = random(4);
  let suffix = "";
  for (const b of bytes) suffix += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `FB${yy}${mm}${dd}-${suffix}`;
}

function randomBytes(n: number) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}

export type PublicOrder = {
  code: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  note: string | null;
  paymentMethod: "cod" | "bank";
  paymentMethodLabel: string;
  status: string;
  items: { id: string; name: string; price: number; quantity: number; lineTotal: number }[];
  totalQuantity: number;
  total: number;
};
