import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { computeCart, PAYMENT_METHODS, type PaymentMethod } from "./catalog";
import {
  generateOrderCode,
  normalizePhone,
  orderInputSchema,
  validateOrderForm,
  type OrderFieldErrors,
  type PublicOrder,
} from "./order-rules";
import type { Database } from "@/integrations/supabase/types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

function toPublic(row: OrderRow): PublicOrder {
  const pm = row.payment_method as PaymentMethod;
  return {
    code: row.code,
    createdAt: row.created_at,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    note: row.note,
    paymentMethod: pm,
    paymentMethodLabel: PAYMENT_METHODS[pm] ?? row.payment_method,
    status: row.status,
    items: row.items as PublicOrder["items"],
    totalQuantity: row.total_quantity,
    total: row.total,
  };
}

export type CreateOrderResult =
  | { ok: true; order: PublicOrder; emailStatus: "sent" | "failed" | "not_configured" }
  | { ok: false; error: string; fields?: OrderFieldErrors };

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderInputSchema.parse(input))
  .handler(async ({ data }): Promise<CreateOrderResult> => {
    if (data.website) return { ok: false, error: "Không gửi được đơn hàng." };

    const { values, errors } = validateOrderForm(data);
    if (Object.keys(errors).length) return { ok: false, error: "Thông tin chưa hợp lệ.", fields: errors };

    // Giá luôn tính lại trên máy chủ từ danh mục, không tin giá từ trình duyệt.
    const cart = computeCart(data.items);
    if (!cart.lines.length) return { ok: false, error: "Giỏ hàng đang trống – vui lòng chọn ít nhất một sản phẩm." };

    const items = cart.lines.map((l) => ({ id: l.id, name: l.name, price: l.price, quantity: l.quantity, lineTotal: l.lineTotal }));
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let row: OrderRow | null = null;
    for (let attempt = 0; attempt < 5 && !row; attempt++) {
      const { data: inserted, error } = await supabaseAdmin
        .from("orders")
        .insert({
          code: generateOrderCode(),
          customer_name: values.customerName,
          phone: values.phone,
          email: values.email || null,
          address: values.address,
          note: values.note || null,
          payment_method: values.paymentMethod,
          items,
          total_quantity: cart.count,
          total: cart.total,
        })
        .select("*")
        .single();
      if (error) {
        if (error.code === "23505") continue; // trùng mã đơn – tạo mã khác
        console.error("Insert order failed", error);
        return { ok: false, error: "Không lưu được đơn hàng. Vui lòng thử lại." };
      }
      row = inserted;
    }
    if (!row) return { ok: false, error: "Không tạo được mã đơn hàng. Vui lòng thử lại." };

    const order = toPublic(row);
    const { sendOrderEmail } = await import("./order-email.server");
    const email = await sendOrderEmail(order);
    await supabaseAdmin
      .from("orders")
      .update({ email_status: email.status, email_error: email.status === "sent" ? null : email.error })
      .eq("id", row.id);

    return { ok: true, order, emailStatus: email.status };
  });

export const lookupOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ code: z.string().trim().min(1).max(40), phone: z.string().trim().min(1).max(30) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ order: PublicOrder | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("code", data.code.toUpperCase())
      .eq("phone", normalizePhone(data.phone))
      .maybeSingle();
    return { order: row ? toPublic(row) : null };
  });
