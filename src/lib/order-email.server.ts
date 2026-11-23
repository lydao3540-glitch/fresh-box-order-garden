// Gửi email thông báo đơn hàng mới về Gmail chủ cửa hàng qua Resend.
// Chỉ chạy trên máy chủ. Khóa API đọc từ biến môi trường, không bao giờ ở trình duyệt.
import { formatVND } from "./catalog";
import type { PublicOrder } from "./order-rules";

export const ORDER_NOTIFY_EMAIL = "lamhuyentham1205@gmail.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export type EmailResult =
  | { status: "sent"; id: string | null }
  | { status: "not_configured"; error: string }
  | { status: "failed"; error: string };

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function buildOrderEmail(o: PublicOrder) {
  const time = new Date(o.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${esc(i.name)}<br/><small style="color:#777">${esc(formatVND(i.price))} / hộp</small></td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${esc(formatVND(i.lineTotal))}</td></tr>`,
    )
    .join("");
  const info: [string, string][] = [
    ["Mã đơn hàng", o.code],
    ["Thời gian đặt", time],
    ["Khách hàng", o.customerName],
    ["Số điện thoại", o.phone],
    ["Email", o.email || "(không có)"],
    ["Địa chỉ giao hàng", o.address],
    ["Thanh toán", o.paymentMethodLabel],
    ["Ghi chú", o.note || "(không có)"],
  ];
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#23301f">
  <h2 style="color:#1f4d2b;margin:0 0 4px">Đơn hàng mới – ${esc(o.code)}</h2>
  <p style="margin:0 0 16px;color:#55604f">Fresh Box vừa nhận một đơn hàng mới.</p>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px">${info
    .map(([k, v]) => `<tr><td style="padding:6px 8px;color:#55604f;width:150px;vertical-align:top">${esc(k)}</td><td style="padding:6px 8px;font-weight:bold">${esc(v)}</td></tr>`)
    .join("")}</table>
  <table style="width:100%;border-collapse:collapse">
    <thead><tr style="background:#e6f2de"><th style="padding:8px;text-align:left">Sản phẩm</th><th style="padding:8px">Số lượng</th><th style="padding:8px;text-align:right">Thành tiền</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td style="padding:10px 8px;font-weight:bold">Tổng cộng (${o.totalQuantity} hộp)</td><td></td><td style="padding:10px 8px;text-align:right;font-weight:bold;color:#1f4d2b;font-size:18px">${esc(formatVND(o.total))}</td></tr></tfoot>
  </table>
</div>`;
  const text = [
    `ĐƠN HÀNG MỚI – FRESH BOX – ${o.code}`,
    ...info.map(([k, v]) => `${k}: ${v}`),
    "",
    "Sản phẩm:",
    ...o.items.map((i, idx) => `${idx + 1}. ${i.name} × ${i.quantity} = ${formatVND(i.lineTotal)}`),
    `Tổng số lượng: ${o.totalQuantity} hộp`,
    `Tổng tiền: ${formatVND(o.total)}`,
  ].join("\n");
  return { subject: `ĐƠN HÀNG MỚI – FRESH BOX – ${o.code}`, html, text };
}

export async function sendOrderEmail(order: PublicOrder): Promise<EmailResult> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    return { status: "not_configured", error: "Chưa kết nối Resend (thiếu RESEND_API_KEY)." };
  }
  const from = process.env["RESEND_FROM_EMAIL"] || "Fresh Box <onboarding@resend.dev>";
  const { subject, html, text } = buildOrderEmail(order);
  try {
    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
        "Idempotency-Key": `order-${order.code}`,
      },
      body: JSON.stringify({
        from,
        to: [ORDER_NOTIFY_EMAIL],
        subject,
        html,
        text,
        ...(order.email ? { reply_to: order.email } : {}),
      }),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error(`Resend failed [${res.status}]: ${body}`);
      return { status: "failed", error: `Resend [${res.status}]: ${body.slice(0, 400)}` };
    }
    let id: string | null = null;
    try {
      id = (JSON.parse(body) as { id?: string }).id ?? null;
    } catch {
      /* ignore */
    }
    return { status: "sent", id };
  } catch (e) {
    console.error("Resend request error", e);
    return { status: "failed", error: e instanceof Error ? e.message : String(e) };
  }
}
